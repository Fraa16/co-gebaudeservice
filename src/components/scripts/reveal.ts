/** Scroll reveals. One observer for the whole page, staggered by DOM order within
 *  each group. Animates opacity and transform only, so it cannot shift layout —
 *  CLS stays at 0.
 *
 *  Nothing here runs when the reader prefers reduced motion: the CSS that hides
 *  .co-reveal lives inside a `prefers-reduced-motion: no-preference` block, so
 *  opting out yields the finished layout with everything already visible. */

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!REDUCED) {
  const items = document.querySelectorAll<HTMLElement>('.co-reveal');

  // Stagger within a group rather than across the whole page, so a section low on
  // the page does not inherit a two-second delay.
  const groups = new Map<Element, number>();
  for (const el of items) {
    const parent = el.parentElement ?? document.body;
    const index = groups.get(parent) ?? 0;
    el.style.setProperty('--co-reveal-index', String(Math.min(index, 6)));
    groups.set(parent, index + 1);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );

  for (const el of items) observer.observe(el);

  // Anything already in view on load reveals immediately, without a delay chain.
  requestAnimationFrame(() => {
    for (const el of items) {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
        el.style.setProperty('--co-reveal-index', '0');
        el.classList.add('is-in');
        observer.unobserve(el);
      }
    }
  });
}

/** Header gains a ground once the page scrolls away from the top. */
const header = document.querySelector<HTMLElement>('[data-site-header]');
if (header) {
  const sync = () => header.classList.toggle('is-stuck', window.scrollY > 12);
  sync();
  window.addEventListener('scroll', sync, { passive: true });
}
