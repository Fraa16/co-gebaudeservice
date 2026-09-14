import type { APIRoute } from 'astro';
import { contactSchema, looksLikeSpam } from '../../lib/contact-schema';

/** The only server-rendered route on the site; every page stays static.
 *
 *  The client validates with this same schema, but the client is not a security
 *  boundary — anything can POST here. So the body is re-parsed, the spam traps are
 *  re-checked, and the request has to come from this site's own origin. */
export const prerender = false;

/** A generous enquiry is a few hundred bytes. 16 kB is room to spare and still small
 *  enough that a junk payload is rejected before it is parsed. */
const MAX_BODY_BYTES = 16 * 1024;

/** Best-effort, per-instance. Serverless instances are ephemeral and there may be many
 *  in parallel, so this is a speed bump against a single noisy source, not a real rate
 *  limiter. A proper one needs shared state (Vercel KV or Upstash) — worth adding only
 *  if the form actually gets abused. */
const RATE_LIMIT = { windowMs: 60_000, max: 5 };
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 500) hits.clear(); // crude ceiling; the map must not grow unbounded
  return recent.length > RATE_LIMIT.max;
}

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

/** Strips control characters from anything that lands in a mail header, so a crafted
 *  name cannot inject one. */
const headerSafe = (s: string) =>
  s
    .split('')
    .filter((c) => c.charCodeAt(0) > 31 && c.charCodeAt(0) !== 127)
    .join('')
    .trim();

const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (request.headers.get('content-type')?.includes('application/json') !== true) {
    return json(415, { error: 'unsupported_media_type' });
  }

  /* Same-origin check without hard-coding the domain: preview deployments get their own
     hostname, so compare Origin against the host this request actually arrived on. */
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (origin && host) {
    let originHost = '';
    try {
      originHost = new URL(origin).host;
    } catch {
      return json(403, { error: 'bad_origin' });
    }
    if (originHost !== host) return json(403, { error: 'cross_origin' });
  }

  const body = await request.text();
  if (body.length > MAX_BODY_BYTES) return json(413, { error: 'payload_too_large' });

  let raw: unknown;
  try {
    raw = JSON.parse(body);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const input = (raw ?? {}) as Record<string, unknown>;

  const parsed = contactSchema.safeParse({
    name: String(input.name ?? ''),
    company: String(input.company ?? ''),
    email: String(input.email ?? ''),
    phone: String(input.phone ?? ''),
    services: Array.isArray(input.services) ? input.services.map(String) : [],
    message: String(input.message ?? ''),
    consent: input.consent === true,
  });

  if (!parsed.success) {
    return json(422, {
      error: 'invalid',
      fields: parsed.error.issues.map((i) => ({ path: String(i.path[0]), message: i.message })),
    });
  }

  /* A bot that tripped a trap gets 202 and nothing is sent: telling it which check it
     failed is telling it what to fix. A real submission never reaches this branch. */
  if (
    looksLikeSpam({
      website: String(input.website ?? ''),
      elapsedMs: Number(input.elapsedMs),
    })
  ) {
    return json(202, { ok: true });
  }

  if (rateLimited(clientAddress ?? 'unknown')) {
    return json(429, { error: 'rate_limited' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  const from = process.env.CONTACT_FROM;

  /* No credentials means nothing was sent. Returning 200 here would be the worst
     possible failure: the reader is told "wir melden uns innerhalb von zwei Werktagen"
     while the enquiry goes nowhere. 503 makes the form say "bitte rufen Sie uns an". */
  if (!apiKey || !to || !from) {
    console.error('kontakt: RESEND_API_KEY, CONTACT_TO or CONTACT_FROM is not set');
    return json(503, { error: 'not_configured' });
  }

  const d = parsed.data;
  const rows: [string, string][] = [
    ['Name', d.name],
    ['Firma', d.company?.trim() || '—'],
    ['E-Mail', d.email],
    ['Telefon', d.phone?.trim() || '—'],
    ['Leistungen', d.services.length ? d.services.join(', ') : '—'],
  ];

  const text = [
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    'Nachricht:',
    d.message,
    '',
    `Gesendet über das Kontaktformular auf ${host ?? 'der Website'}.`,
  ].join('\n');

  const html = [
    '<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5;color:#0A2540">',
    '<table cellpadding="0" cellspacing="0" style="border-collapse:collapse">',
    ...rows.map(
      ([k, v]) =>
        `<tr><td style="padding:4px 16px 4px 0;color:#4C6B85">${escapeHtml(k)}</td>` +
        `<td style="padding:4px 0"><strong>${escapeHtml(v)}</strong></td></tr>`,
    ),
    '</table>',
    '<p style="margin:20px 0 4px;color:#4C6B85">Nachricht:</p>',
    `<p style="margin:0;white-space:pre-wrap">${escapeHtml(d.message)}</p>`,
    `<p style="margin:24px 0 0;color:#4C6B85;font-size:13px">Gesendet über das Kontaktformular auf ${escapeHtml(host ?? 'der Website')}.</p>`,
    '</div>',
  ].join('');

  /* Resend's REST API directly rather than the `resend` package: it is one POST, and an
     internal-notification endpoint does not need another runtime dependency. */
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: headerSafe(d.email),
        subject: `Neue Anfrage über die Website — ${headerSafe(d.name)}`,
        text,
        html,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      /* Resend's error body names the cause (unverified domain, bad key). Log that —
         never the enquiry itself, which is personal data. */
      console.error('kontakt: Resend rejected the send', res.status, await res.text());
      return json(502, { error: 'send_failed' });
    }
  } catch (cause) {
    console.error('kontakt: could not reach Resend', cause);
    return json(502, { error: 'send_failed' });
  }

  return json(200, { ok: true });
};

/** Anything that is not a POST gets a plain 405 rather than Astro's HTML 404. */
export const ALL: APIRoute = () =>
  new Response(null, { status: 405, headers: { allow: 'POST' } });
