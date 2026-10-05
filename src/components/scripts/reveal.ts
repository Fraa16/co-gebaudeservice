/** Header gains a solid ground once the page scrolls away from the top, and on a
 *  short screen it steps out of the way while the reader scrolls down.
 *
 *  Purely an enhancement: if this never runs, the header simply keeps its glass
 *  treatment and stays put. Nothing on the page depends on it to be visible — the
 *  scroll reveals are CSS-only for exactly that reason (see global.css). */
const header = document.querySelector<HTMLElement>('[data-site-header]');

/** Above this share of the screen's height the sticky header tucks away on the way
 *  down. A phone held sideways is 320 to 430px tall and the header 66 to 80px, so it
 *  covered a fifth of the screen on every scroll; upright phones, tablets and
 *  desktops sit at 8 to 11% and never reach this, so for them nothing changes. */
const SHORT_SCREEN_SHARE = 0.15;

/** Movements smaller than this are a thumb resting, not a direction. */
const JITTER = 4;

if (header) {
  let lastY = window.scrollY;

  const sync = () => {
    const y = window.scrollY;
    header.classList.toggle('is-stuck', y > 12);

    const delta = y - lastY;
    if (Math.abs(delta) < JITTER) return;
    lastY = y;

    const short = header.offsetHeight / window.innerHeight > SHORT_SCREEN_SHARE;
    // Never while the menu is open or a control in it has keyboard focus.
    const busy = header.matches(':focus-within') || header.querySelector('details[open]') !== null;
    const tuck = short && !busy && delta > 0 && y > header.offsetHeight * 2;
    header.classList.toggle('is-tucked', tuck);
  };

  sync();
  window.addEventListener('scroll', sync, { passive: true });
  // Turning the phone upright, or tabbing into the header, brings it straight back.
  window.addEventListener('resize', () => header.classList.remove('is-tucked'));
  header.addEventListener('focusin', () => header.classList.remove('is-tucked'));
}
