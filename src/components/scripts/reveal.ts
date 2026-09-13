/** Header gains a solid ground once the page scrolls away from the top.
 *
 *  Purely decorative: if this never runs, the header simply keeps its glass
 *  treatment. Nothing on the page depends on it to be visible — the scroll
 *  reveals are CSS-only for exactly that reason (see global.css). */
const header = document.querySelector<HTMLElement>('[data-site-header]');

if (header) {
  const sync = () => header.classList.toggle('is-stuck', window.scrollY > 12);
  sync();
  window.addEventListener('scroll', sync, { passive: true });
}
