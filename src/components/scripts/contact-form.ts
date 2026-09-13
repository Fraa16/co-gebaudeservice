import { contactSchema, looksLikeSpam } from '../../lib/contact-schema';

/** The only client JS on the site: chip toggling, German validation messages, and the
 *  submit seam. When the Resend endpoint lands, data-endpoint is set and the same
 *  payload is POSTed instead of resolving locally — nothing else here changes. */

const form = document.querySelector<HTMLFormElement>('[data-contact-form]');

if (form) {
  const successPanel = form.querySelector<HTMLElement>('[data-form-success]');
  const stamp = form.querySelector<HTMLInputElement>('[data-rendered-at]');
  if (stamp) stamp.value = String(Date.now());

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

    if (looksLikeSpam({ website: raw('website'), renderedAt: raw('renderedAt') })) {
      // Fail quietly — do not tell a bot which trap it hit.
      successPanel?.removeAttribute('hidden');
      return;
    }

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

    const endpoint = form.dataset.endpoint;
    if (endpoint) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(parsed.data),
        });
        if (!res.ok) throw new Error(String(res.status));
      } catch {
        showError('message', 'Die Anfrage konnte nicht gesendet werden. Bitte rufen Sie uns an.');
        return;
      }
    }

    form.reset();
    chipWrap?.querySelectorAll('[aria-pressed]').forEach((c) => c.setAttribute('aria-pressed', 'false'));
    syncChips();
    if (stamp) stamp.value = String(Date.now());
    successPanel?.removeAttribute('hidden');
    successPanel?.focus?.();
  });
}
