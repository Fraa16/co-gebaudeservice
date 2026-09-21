
/** The validator is ~19 kB of zod for four field checks. Loading it with the page put
 *  that on every visitor, including the ones who never touch the form, so it is
 *  fetched on first interaction and cached — warm long before anyone can submit. */
let validatorPromise: Promise<typeof import('../../lib/contact-schema')> | null = null;
const loadValidator = () => (validatorPromise ??= import('../../lib/contact-schema'));

/** The only client JS on the site: chip toggling, German validation messages, and the
 *  submit seam. data-endpoint decides what a valid submit does: POST it, or refuse it
 *  with data-offline-notice. There is no third path, and in particular no path that
 *  confirms an enquiry nothing received. */

const form = document.querySelector<HTMLFormElement>('[data-contact-form]');

if (form) {
  const successPanel = form.querySelector<HTMLElement>('[data-form-success]');
  const stamp = form.querySelector<HTMLInputElement>('[data-rendered-at]');
  if (stamp) stamp.value = String(Date.now());

  // Warm the validator as soon as the reader engages with the form at all.
  form.addEventListener('focusin', loadValidator, { once: true });
  form.addEventListener('pointerdown', loadValidator, { once: true });

  // --- chips ---------------------------------------------------------------
  const chipWrap = form.querySelector<HTMLElement>('[data-chip-group]');
  const chipMirror = form.querySelector<HTMLInputElement>('[data-chip-mirror]');

  const syncChips = () => {
    if (!chipWrap || !chipMirror) return;
    const on = [...chipWrap.querySelectorAll<HTMLButtonElement>('[aria-pressed="true"]')];
    chipMirror.value = on.map((b) => b.dataset.chipValue ?? '').join(', ');
  };

  chipWrap?.addEventListener('click', (event) => {
    const chip = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-chip-value]');
    if (!chip) return;
    chip.setAttribute('aria-pressed', chip.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    syncChips();
  });

  /* Arriving from a service: /kontakt?leistung=gartenpflege#anfrage preselects that
     chip. Every page is prerendered, so the query string can only be read here; without
     JS the chips simply start empty, which is what they did before. Several are
     accepted, because someone who wants two of them should be able to link to both. */
  const wanted = new URLSearchParams(location.search).getAll('leistung').flatMap((v) => v.split(','));
  if (wanted.length && chipWrap) {
    for (const slug of wanted) {
      chipWrap
        .querySelector<HTMLButtonElement>(`[data-chip-slug="${CSS.escape(slug.trim())}"]`)
        ?.setAttribute('aria-pressed', 'true');
    }
    syncChips();
  }

  // --- validation ----------------------------------------------------------
  const showError = (field: string, message: string) => {
    const slot = form.querySelector<HTMLElement>(`[data-error-for="${field}"]`);
    if (slot) slot.textContent = message;
    const input = form.querySelector<HTMLElement>(`[name="${field}"]`);
    input?.setAttribute('aria-invalid', 'true');
  };

  const clearErrors = () => {
    form.querySelectorAll<HTMLElement>('[data-error-for]').forEach((el) => (el.textContent = ''));
    form.querySelectorAll<HTMLElement>('[aria-invalid]').forEach((el) =>
      el.removeAttribute('aria-invalid'),
    );
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors();
    successPanel?.setAttribute('hidden', '');

    const data = new FormData(form);
    const raw = (key: string) => String(data.get(key) ?? '');

    const { contactSchema, looksLikeSpam } = await loadValidator();

    const parsed = contactSchema.safeParse({
      name: raw('name'),
      company: raw('company'),
      email: raw('email'),
      phone: raw('phone'),
      services: raw('services') ? raw('services').split(', ') : [],
      message: raw('message'),
      consent: data.get('consent') === 'on',
    });

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        showError(String(issue.path[0]), issue.message);
      }
      form
        .querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus({ preventScroll: false });
      return;
    }

    // Only after the input is valid: a person who fills the form correctly but fast
    // still gets the quiet treatment, while an empty submit gets its field errors.
    // How long the form was on screen, by this machine's clock only — see the note on
    // looksLikeSpam for why a duration travels and a timestamp does not.
    const elapsedMs = Date.now() - Number(raw('renderedAt'));

    if (looksLikeSpam({ website: raw('website'), elapsedMs })) {
      // Fail quietly — do not tell a bot which trap it hit.
      form.reset();
      successPanel?.removeAttribute('hidden');
      return;
    }

    const endpoint = form.dataset.endpoint;
    if (!endpoint) {
      /* No delivery route configured: refuse rather than confirm. This branch used to
         fall through to the success panel, which told the visitor "wir melden uns"
         about an enquiry that was never sent anywhere — the single worst thing this
         form can do, because the customer stops looking for another way to reach us.
         The form already carries the same sentence above the fields, so nobody gets
         here uninformed; it is repeated at the button because a submit that appears to
         do nothing is its own kind of broken.

         Written into the error slot directly rather than through showError, which also
         sets aria-invalid: nothing the visitor typed is wrong, so telling a screen
         reader the message field is invalid would be a second untruth. The slot is
         already the textarea's aria-describedby target, so it is announced where it
         is relevant. */
      const slot = form.querySelector<HTMLElement>('[data-error-for="message"]');
      if (slot) {
        slot.textContent = form.dataset.offlineNotice ?? '';
        slot.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
      return;
    }

    let res: Response;
    try {
      res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        // The traps travel with the payload: the endpoint re-checks them, because a
        // bot can POST to it without ever loading the form.
        body: JSON.stringify({ ...parsed.data, website: raw('website'), elapsedMs }),
      });
    } catch {
      showError('message', 'Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.');
      return;
    }

    if (!res.ok) {
      // 422 means the server disagreed with the client about a field. That should be
      // impossible — both parse with the same schema — so surface it on the field
      // rather than hiding it behind a generic message.
      if (res.status === 422) {
        const detail = await res.json().catch(() => null);
        const fields = (detail?.fields ?? []) as { path: string; message: string }[];
        for (const f of fields) showError(f.path, f.message);
        form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
        return;
      }
      showError(
        'message',
        res.status === 429
          ? 'Zu viele Anfragen. Bitte versuchen Sie es in einer Minute erneut.'
          : 'Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.',
      );
      return;
    }

    form.reset();
    chipWrap?.querySelectorAll('[aria-pressed]').forEach((c) => c.setAttribute('aria-pressed', 'false'));
    syncChips();
    if (stamp) stamp.value = String(Date.now());
    successPanel?.removeAttribute('hidden');
    successPanel?.focus?.();
  });
}
