import { test, expect } from '@playwright/test';
import { POST } from '../src/pages/api/kontakt';

/** The contact endpoint, exercised directly — no browser and no server. It is the only
 *  server-rendered route on the site and the only one handling personal data, so its
 *  rejection paths matter more than its happy path.
 *
 *  Runs once (see testIgnore in playwright.config.ts); nothing here is viewport-dependent. */

const ORIGIN = 'https://www.co-gebaeudeservice.de';
const HOST = 'www.co-gebaeudeservice.de';

const VALID = {
  name: 'Anna Beispiel',
  company: 'Hausverwaltung Beispiel GmbH',
  email: 'anna@beispiel.de',
  phone: '07452 123456',
  services: ['Treppenhausreinigung'],
  message: 'Wir suchen eine wöchentliche Treppenhausreinigung für zwei Objekte.',
  consent: true,
  website: '',
  elapsedMs: 45_000,
};

const call = (
  body: unknown,
  { origin = ORIGIN, host = HOST, contentType = 'application/json' } = {},
) => {
  const headers = new Headers();
  if (contentType) headers.set('content-type', contentType);
  if (origin) headers.set('origin', origin);
  if (host) headers.set('host', host);

  const request = new Request('https://www.co-gebaeudeservice.de/api/kontakt', {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

  // The route only reads `request` and `clientAddress` off the context.
  return POST({ request, clientAddress: `10.0.0.${Math.floor(Math.random() * 250)}` } as never);
};

/** Swaps in a fake Resend so nothing leaves the machine, and records what was sent. */
function stubResend(response = new Response('{}', { status: 200 })) {
  const calls: { url: string; init: RequestInit }[] = [];
  const real = globalThis.fetch;
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    calls.push({ url: String(url), init });
    return response;
  }) as typeof fetch;
  return { calls, restore: () => (globalThis.fetch = real) };
}

function withCredentials() {
  process.env.RESEND_API_KEY = 'test-key';
  process.env.CONTACT_TO = 'oguz@example.de';
  process.env.CONTACT_FROM = 'Website <noreply@example.de>';
}
function withoutCredentials() {
  delete process.env.RESEND_API_KEY;
  delete process.env.CONTACT_TO;
  delete process.env.CONTACT_FROM;
}

test('a non-JSON content type is refused', async () => {
  const res = await call(VALID, { contentType: 'text/plain' });
  expect(res.status).toBe(415);
});

test('a cross-origin post is refused', async () => {
  const res = await call(VALID, { origin: 'https://angreifer.example' });
  expect(res.status).toBe(403);
});

test('a malformed body is refused', async () => {
  const res = await call('{not json', {});
  expect(res.status).toBe(400);
});

test('an invalid enquiry comes back as field errors, not a generic failure', async () => {
  const res = await call({ ...VALID, email: 'keine-mail', message: 'zu kurz' });
  expect(res.status).toBe(422);
  const body = (await res.json()) as { fields: { path: string; message: string }[] };
  expect(body.fields.map((f) => f.path).sort()).toEqual(['email', 'message']);
  // German messages, straight from the shared schema.
  expect(body.fields.every((f) => /[a-zäöüß]/i.test(f.message))).toBe(true);
});

test('consent is mandatory', async () => {
  const res = await call({ ...VALID, consent: false });
  expect(res.status).toBe(422);
  const body = (await res.json()) as { fields: { path: string }[] };
  expect(body.fields.map((f) => f.path)).toContain('consent');
});

test('a filled honeypot is accepted silently and sends nothing', async () => {
  withCredentials();
  const resend = stubResend();
  try {
    const res = await call({ ...VALID, website: 'http://spam.example' });
    expect(res.status).toBe(202);
    expect(resend.calls, 'nothing may be sent for a trapped submission').toHaveLength(0);
  } finally {
    resend.restore();
  }
});

test('a form submitted faster than a human could type is accepted silently', async () => {
  withCredentials();
  const resend = stubResend();
  try {
    const res = await call({ ...VALID, elapsedMs: 400 });
    expect(res.status).toBe(202);
    expect(resend.calls).toHaveLength(0);
  } finally {
    resend.restore();
  }
});

test('a clock-skewed elapsed time is not treated as spam', async () => {
  /* The trap used to compare the server clock against a timestamp from the visitor's
     machine, so a visitor whose clock ran fast produced a negative age and had a real
     enquiry dropped in silence. The client now sends a duration instead. */
  withCredentials();
  const resend = stubResend();
  try {
    const res = await call({ ...VALID, elapsedMs: -90_000 });
    expect(res.status).toBe(200);
    expect(resend.calls, 'a skewed clock must not silence a real enquiry').toHaveLength(1);
  } finally {
    resend.restore();
  }
});

test('without credentials it fails loudly rather than pretending to send', async () => {
  /* The worst possible outcome for this form: telling someone "wir melden uns innerhalb
     von zwei Werktagen" while the enquiry goes nowhere. */
  withoutCredentials();
  const res = await call(VALID);
  expect(res.status).toBe(503);
  expect(res.status, 'an unconfigured endpoint must never report success').not.toBe(200);
});

test('a valid enquiry reaches Resend with the reply-to set to the sender', async () => {
  withCredentials();
  const resend = stubResend();
  try {
    const res = await call(VALID);
    expect(res.status).toBe(200);
    expect(resend.calls).toHaveLength(1);

    const sent = JSON.parse(String(resend.calls[0]!.init.body)) as Record<string, string>;
    expect(resend.calls[0]!.url).toBe('https://api.resend.com/emails');
    expect(sent.reply_to).toBe(VALID.email);
    expect(sent.subject).toContain(VALID.name);
    expect(sent.text).toContain(VALID.message);
    expect(sent.text).toContain('Treppenhausreinigung');
  } finally {
    resend.restore();
  }
});

test('a header injection attempt in the name cannot break out of the subject', async () => {
  withCredentials();
  const resend = stubResend();
  try {
    await call({ ...VALID, name: 'Anna\r\nBcc: opfer@example.de' });
    const sent = JSON.parse(String(resend.calls[0]!.init.body)) as Record<string, string>;
    expect(sent.subject).not.toContain('\r');
    expect(sent.subject).not.toContain('\n');
  } finally {
    resend.restore();
  }
});

test('a message containing markup is escaped in the HTML body', async () => {
  withCredentials();
  const resend = stubResend();
  try {
    await call({ ...VALID, message: 'Hallo <img src=x onerror=alert(1)> bitte melden.' });
    const sent = JSON.parse(String(resend.calls[0]!.init.body)) as Record<string, string>;
    expect(sent.html).not.toContain('<img');
    expect(sent.html).toContain('&lt;img');
  } finally {
    resend.restore();
  }
});

test('a Resend outage surfaces as a failure, not a false success', async () => {
  withCredentials();
  const resend = stubResend(new Response('domain not verified', { status: 403 }));
  try {
    const res = await call(VALID);
    expect(res.status).toBe(502);
  } finally {
    resend.restore();
  }
});

test('repeated posts from one address are rate limited', async () => {
  withCredentials();
  const resend = stubResend();
  try {
    const headers = new Headers({ 'content-type': 'application/json', origin: ORIGIN, host: HOST });
    const send = () =>
      POST({
        request: new Request('https://www.co-gebaeudeservice.de/api/kontakt', {
          method: 'POST',
          headers,
          body: JSON.stringify(VALID),
        }),
        clientAddress: '203.0.113.7',
      } as never);

    const statuses: number[] = [];
    for (let i = 0; i < 7; i++) statuses.push((await send()).status);

    expect(statuses.slice(0, 5).every((s) => s === 200)).toBe(true);
    expect(statuses.at(-1)).toBe(429);
  } finally {
    resend.restore();
  }
});
