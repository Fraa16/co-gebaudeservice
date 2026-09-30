import { test, expect } from '@playwright/test';
import { ROUTES } from './routes';

/** The suite previously checked four viewports for horizontal overflow only, which is
 *  the coarsest possible responsiveness test. A sweep found three classes of fault it
 *  could not see: a type scale that sat on its floor from 320px to 704px, rows of four
 *  that stranded a lone item at tablet widths, and prose running past 100 characters.
 *  These run once, at the reference viewport, and drive the browser themselves. */

const WIDTHS = [320, 360, 390, 414, 480, 540, 600, 667, 720, 768, 834, 900, 1024, 1180, 1280, 1440, 1600, 1920];

test('the type scale is fluid, not flat, across the phone-to-tablet band', async ({ page }) => {
  const sizes: number[] = [];
  for (const w of [360, 480, 600, 768]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto('/');
    sizes.push(
      await page.locator('.hero__title').evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
    );
  }
  // Each step up in viewport must grow the display type.
  for (let i = 1; i < sizes.length; i++) {
    expect(sizes[i], `display type did not grow between steps: ${sizes.join(' → ')}`).toBeGreaterThan(
      sizes[i - 1]!,
    );
  }
});

test('no row of four strands a single item on its own line', async ({ page }) => {
  const stranded: string[] = [];
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: 900 });
    for (const route of ['/', '/leistungen', '/ueber-uns', '/kontakt']) {
      await page.goto(route);
      const bad = await page.evaluate(() => {
        const out: string[] = [];
        for (const row of document.querySelectorAll('.co-row-4')) {
          const kids = [...row.children].filter((k) => k.getBoundingClientRect().width > 0);
          if (kids.length < 3) continue;
          const rows = new Map<number, number>();
          for (const k of kids) {
            const top = Math.round(k.getBoundingClientRect().top);
            rows.set(top, (rows.get(top) ?? 0) + 1);
          }
          const counts = [...rows.values()];
          if (counts.length > 1 && counts.at(-1) === 1 && Math.max(...counts) >= 3) {
            out.push(`${[...row.classList][0]} (${counts.join('+')})`);
          }
        }
        return out;
      });
      for (const b of bad) stranded.push(`${w}px ${route}: ${b}`);
    }
  }
  expect(stranded).toEqual([]);
});

test('running prose stays within a readable measure', async ({ page }) => {
  const tooWide: string[] = [];
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: 900 });
    for (const route of ROUTES) {
      await page.goto(route);
      const bad = await page.evaluate(() => {
        const out: string[] = [];
        for (const el of document.querySelectorAll('p, li')) {
          const text = (el.textContent ?? '').trim();
          if (text.length < 120) continue;
          const fs = parseFloat(getComputedStyle(el).fontSize);
          const width = el.getBoundingClientRect().width;
          if (!fs || !width) continue;
          const ch = width / (fs * 0.5);
          if (ch > 95) out.push(`${[...el.classList][0] ?? el.tagName} ≈${Math.round(ch)}ch`);
        }
        return out;
      });
      for (const b of bad) tooWide.push(`${w}px ${route}: ${b}`);
    }
  }
  expect(tooWide).toEqual([]);
});

test('no horizontal scroll at any width', async ({ page }) => {
  const overflowing: string[] = [];
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: 900 });
    for (const route of ROUTES) {
      await page.goto(route);
      const over = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      if (over > 1) overflowing.push(`${w}px ${route} +${over}px`);
    }
  }
  expect(overflowing).toEqual([]);
});

/** The sweep that caught the flat type scale still missed a hero whose floating panels
 *  landed on top of the buttons, and a header eating a fifth of a phone screen —
 *  absolutely-positioned elements overlap without ever causing overflow, and a tall
 *  header is perfectly valid layout. These two check for that directly. */
test('no element overlaps another at mobile widths', async ({ page }) => {
  const collisions: string[] = [];
  for (const w of [320, 360, 380, 414, 480, 600, 768]) {
    await page.setViewportSize({ width: w, height: 800 });
    for (const route of ['/', '/leistungen', '/ueber-uns', '/kontakt']) {
      await page.goto(route);
      const hits = await page.evaluate(() => {
        const clipped = (el: Element) => {
          for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
            const cs = getComputedStyle(n);
            if (cs.overflowX === 'hidden' || cs.overflowX === 'clip' || cs.clipPath !== 'none') return true;
          }
          return getComputedStyle(el).clipPath !== 'none';
        };
        const label = (e: Element) => `${e.tagName.toLowerCase()}.${[...e.classList][0] ?? ''}`;
        // A closed <details> still reports boxes for its contents, so visibility has
        // to be checked properly rather than inferred from the rect.
        const visible = (el: Element) =>
          typeof el.checkVisibility === 'function'
            ? el.checkVisibility({ contentVisibilityAuto: true, opacityProperty: true, visibilityProperty: true })
            : true;
        // A fixed element floats over the page by design — the WhatsApp button is
        // supposed to sit on top of whatever is under it. Only in-flow collisions are
        // faults. (The header is sticky, not fixed, so it stays checked.)
        const floating = (el: Element) => getComputedStyle(el).position === 'fixed';

        const nodes = [...document.querySelectorAll('a, button, h1, h2, h3, .hero__float, .co-btn')]
          .map((e) => ({ e, b: e.getBoundingClientRect() }))
          .filter(
            (x) =>
              x.b.width > 8 && x.b.height > 8 && visible(x.e) && !clipped(x.e) && !floating(x.e),
          );
        const out: string[] = [];
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const A = nodes[i]!, B = nodes[j]!;
            if (A.e.contains(B.e) || B.e.contains(A.e)) continue;
            const ox = Math.min(A.b.right, B.b.right) - Math.max(A.b.left, B.b.left);
            const oy = Math.min(A.b.bottom, B.b.bottom) - Math.max(A.b.top, B.b.top);
            if (ox > 6 && oy > 6) out.push(`${label(A.e)} over ${label(B.e)}`);
          }
        }
        return [...new Set(out)];
      });
      for (const h of hits) collisions.push(`${w}px ${route}: ${h}`);
    }
  }
  expect(collisions).toEqual([]);
});

test('the header stays compact on a phone and its menu works without JS', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 380, height: 751 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');

  // A header taller than ~80px eats the top of a phone screen; it was 162px.
  const header = (await page.locator('.site-header').boundingBox())!;
  expect(Math.round(header.height), 'header height on a 380px screen').toBeLessThanOrEqual(80);

  // The menu button must be reachable, not pushed off the edge.
  const toggle = (await page.locator('.site-header__toggle').boundingBox())!;
  expect(toggle.x + toggle.width, 'menu button right edge').toBeLessThanOrEqual(381);

  await expect(page.locator('.site-header__panel')).toBeHidden();
  await page.locator('.site-header__toggle').click();
  await expect(page.locator('.site-header__panel')).toBeVisible();
  expect(await page.locator('.site-header__panel-link').count()).toBeGreaterThan(2);
  await ctx.close();
});

test('interactive targets meet the WCAG 2.5.8 minimum of 24px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const small: string[] = [];
  for (const route of ['/', '/kontakt']) {
    await page.goto(route);
    const bad = await page.evaluate(() =>
      [...document.querySelectorAll('button, input:not([type="hidden"]), textarea, select')]
        .map((el) => ({ el, r: el.getBoundingClientRect() }))
        .filter((x) => x.r.width > 0 && (x.r.width < 24 || x.r.height < 24))
        .map((x) => `${x.el.tagName.toLowerCase()}.${[...x.el.classList][0]} ${Math.round(x.r.width)}x${Math.round(x.r.height)}`),
    );
    for (const b of bad) small.push(`${route}: ${b}`);
  }
  expect(small).toEqual([]);
});

test('every control a thumb can reach answers across 44px on touch widths', async ({ page }) => {
  /* The 24px test above measures boxes, and only of buttons and inputs. It passed a
     home tile whose photograph and ↗ button did nothing when tapped (the link's overlay
     covered the text block only), a 20px phone number, 36px nav pills on a tablet and
     20px Impressum links. This hit-tests instead: from each control's centre it walks
     outward with elementFromPoint and measures how far the control still answers. That
     counts an invisible hit area — a pill's ::after, a stretched link — the way a
     finger does, and it fails a target something else is lying on.

     44px is Apple's minimum and roughly a fingertip; WCAG 2.5.8 asks only 24. Two
     exemptions, both from WCAG: a link inside a sentence, and a checkbox, which is 24px
     here with its whole label as the target. */
  const bad: string[] = [];
  for (const width of [360, 390, 768]) {
    await page.setViewportSize({ width, height: 800 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const route of ROUTES) {
      await page.goto(route);
      const hits = await page.evaluate(() => {
        const out: string[] = [];
        const controls = document.querySelectorAll<HTMLElement>(
          'a[href], button, summary, select, textarea, input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])',
        );
        for (const el of controls) {
          if (el.closest('[aria-hidden="true"], .contact-form__trap, .co-skip-link')) continue;
          if (!el.checkVisibility({ visibilityProperty: true, opacityProperty: true })) continue;

          // A link that is part of a sentence: its nearest block holds more text than it.
          if (el.tagName === 'A' && getComputedStyle(el).display === 'inline') {
            let block = el.parentElement;
            while (block && getComputedStyle(block).display === 'inline') block = block.parentElement;
            const own = (el.textContent ?? '').trim().length;
            if (block && (block.textContent ?? '').trim().length > own + 3) continue;
          }

          el.scrollIntoView({ block: 'center', inline: 'nearest' });
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) continue;
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const answers = (x: number, y: number) => {
            const hit = document.elementFromPoint(x, y);
            return !!hit && (hit === el || el.contains(hit));
          };
          const reach = (dx: number, dy: number) => {
            let n = 0;
            for (let d = 0.5; d < 80; d += 0.5) {
              if (!answers(cx + dx * d, cy + dy * d)) break;
              n = d;
            }
            return n;
          };
          const name = `${el.tagName.toLowerCase()}.${[...el.classList][0] ?? ''} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 24)}"`;
          if (!answers(cx, cy)) {
            out.push(`${name} is covered at its centre`);
            continue;
          }
          const w = reach(-1, 0) + reach(1, 0);
          const h = reach(0, -1) + reach(0, 1);
          // Half-pixel sampling: 43 is 44 within the step.
          if (w < 43 || h < 43) out.push(`${name} answers across ${w}×${h}px`);
        }
        return [...new Set(out)];
      });
      for (const h of hits) bad.push(`${width}px ${route}: ${h}`);
    }
  }
  expect(bad).toEqual([]);
});

test('a home service tile answers a tap anywhere on it', async ({ page }) => {
  /* The tiles look like one big link — a photograph, a chip, a ↗ button in the
     corner — and for months only the title and teaser were. The overlay meant to cover
     the tile had the text block as its containing block. On a phone the photo is
     most of the tile, so most taps did nothing. */
  const dead: string[] = [];
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    // The floating button and the sticky header lie over whatever scrolls under them,
    // by design; a tile corner under either is not a dead spot on the tile.
    await page.addStyleTag({
      content: 'a[href*="wa.me"], .site-header { visibility: hidden !important; }',
    });
    const tiles = page.locator('.tile.is-linked');
    const count = await tiles.count();
    expect(count, 'linked tiles on the home page').toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await tiles.nth(i).scrollIntoViewIfNeeded();
      const misses = await tiles.nth(i).evaluate((tile) => {
        const link = tile.querySelector('.tile__title a');
        const b = tile.getBoundingClientRect();
        const arrow = tile.querySelector('.tile__arrow')!.getBoundingClientRect();
        const chip = tile.querySelector('.tile__chip')!.getBoundingClientRect();
        const points: [string, number, number][] = [
          ['photo', b.left + b.width / 2, b.top + b.height * 0.35],
          ['↗ button', arrow.left + arrow.width / 2, arrow.top + arrow.height / 2],
          ['chip', chip.left + chip.width / 2, chip.top + chip.height / 2],
          ['corner', b.right - 12, b.bottom - 12],
        ];
        return points
          .filter(([, x, y]) => document.elementFromPoint(x, y)?.closest('a') !== link)
          .map(([where]) => `${tile.id}: the ${where}`);
      });
      for (const m of misses) dead.push(`${width}px ${m}`);
    }
  }
  expect(dead, 'places on a tile where a tap does nothing').toEqual([]);
});

test('the page frame stops growing at 1920px and stays centred', async ({ page }) => {
  /* Fully fluid below 1920; above it the cards kept stretching — 2520px on a 2560
     monitor, where the bento's closing card became an empty ink band across the whole
     row. --co-page-max holds the 1920 composition and centres it. The WhatsApp button
     follows the frame, so it does not float alone on the bare ground in the corner. */
  for (const width of [1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const frame = (await page.locator('.co-page').boundingBox())!;
    expect(Math.round(frame.width), `${width}px: the frame should still be fluid`).toBe(width);
  }

  for (const width of [2560, 3000]) {
    await page.setViewportSize({ width, height: 1200 });
    await page.goto('/');
    const m = await page.evaluate(() => {
      const frame = document.querySelector('.co-page')!.getBoundingClientRect();
      const hero = document.querySelector('.hero')!.getBoundingClientRect();
      const wa = document.querySelector('a[href*="wa.me"]')?.getBoundingClientRect();
      return {
        frame: { left: frame.left, right: frame.right, width: frame.width },
        hero: hero.width,
        viewport: document.documentElement.clientWidth,
        waRight: wa?.right ?? null,
      };
    });
    expect(Math.round(m.frame.width), `${width}px: frame width`).toBe(1920);
    expect(Math.abs(m.frame.left - (m.viewport - m.frame.right)), `${width}px: frame centred`).toBeLessThan(1);
    expect(m.hero, `${width}px: hero width`).toBeLessThanOrEqual(1920);
    if (m.waRight !== null) {
      expect(m.waRight, `${width}px: WhatsApp button inside the frame`).toBeLessThanOrEqual(m.frame.right + 1);
    }
  }
});

test('on a phone the hero photograph is shown, not veiled behind the text', async ({ page }) => {
  /* Below 720px the headline runs the full width, so a photo behind it needed a veil
     of .84 for dark type over his navy shirt, and the client's chosen hero photo was
     a pale smear on every phone. It now stands under the text as a framed image of its
     own. From 720px it is behind the text again, full bleed, beside the headline. */
  for (const width of [360, 390, 600]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const m = await page.evaluate(() => {
      const box = (s: string) => document.querySelector(s)!.getBoundingClientRect();
      const media = box('.hero__media');
      const text = [box('.hero__title'), box('.hero__sub'), box('.hero__actions')];
      const overlaps = text.some((t) => t.bottom > media.top && t.top < media.bottom);
      const veil = getComputedStyle(document.querySelector('.hero__scrim')!).display;
      return { height: media.height, overlaps, veil };
    });
    expect(m.overlaps, `${width}px: text over the hero photo`).toBe(false);
    expect(m.height, `${width}px: hero photo height`).toBeGreaterThan(200);
    expect(m.veil, `${width}px: hero veil`).toBe('none');
  }

  await page.setViewportSize({ width: 924, height: 900 });
  await page.goto('/');
  const wide = await page.evaluate(() => {
    const media = document.querySelector('.hero__media')!.getBoundingClientRect();
    const title = document.querySelector('.hero__title')!.getBoundingClientRect();
    return title.top >= media.top && title.bottom <= media.bottom;
  });
  expect(wide, '924px: the photo is full bleed behind the headline').toBe(true);
});

test('stacked cards keep an even rhythm', async ({ page }) => {
  /* The Ablauf steps stagger — every second card drops — which is the point side by
     side and a fault stacked: one column with the same drop put 36px above every second
     card and 8px below it. */
  const bad: string[] = [];
  for (const width of [320, 390, 480]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const gaps = await page.evaluate(() => {
      const steps = [...document.querySelectorAll('.process__step > *')].map((s) => s.getBoundingClientRect());
      return steps.slice(1).map((s, i) => Math.round(s.top - steps[i]!.bottom));
    });
    if (new Set(gaps).size > 1) bad.push(`${width}px: gaps between steps ${gaps.join(', ')}`);
  }
  expect(bad).toEqual([]);
});

test('hairline dividers do not survive a wrap into a stacked column', async ({ page }) => {
  /* A `border-left` divider on a wrapping row stays put when the row stacks, so items
     2..n render indented behind a stray vertical rule while the first sits flush. It
     shipped twice — on the stat band, and on the Leistungen and Kontakt fact rows — and
     is invisible to an overflow test because nothing overflows. Once there is a single
     column, every item in a divided group must start at the same x. */
  const GROUPS = [
    { route: '/', selector: '.co-row-4--divided' },
    { route: '/leistungen', selector: '.page-hero__meta' },
    { route: '/kontakt', selector: '.reach__routes' },
    { route: '/impressum', selector: '.page-hero__meta' },
  ];

  const bad: string[] = [];
  for (const width of [320, 360, 390, 480]) {
    await page.setViewportSize({ width, height: 900 });
    for (const { route, selector } of GROUPS) {
      await page.goto(route);
      const report = await page.evaluate((sel) => {
        const group = document.querySelector(sel);
        if (!group) return { missing: true, offsets: [], borders: [] };
        const kids = [...group.children];
        return {
          missing: false,
          offsets: kids.map((el) => Math.round(el.getBoundingClientRect().left)),
          borders: kids.map((el) => parseFloat(getComputedStyle(el).borderLeftWidth)),
        };
      }, selector);

      expect(report.missing, `${route} ${selector} should exist`).toBe(false);

      const stacked = new Set(report.offsets).size === 1 || report.offsets.length < 2;
      if (!stacked) continue; // side by side at this width: a left rule is correct there

      const leftEdges = new Set(report.offsets);
      if (leftEdges.size > 1) {
        bad.push(`${width}px ${route} ${selector}: ragged left edges ${[...leftEdges].join(', ')}`);
      }
      report.borders.forEach((b, i) => {
        if (b > 0) bad.push(`${width}px ${route} ${selector}: item ${i} keeps a ${b}px left rule while stacked`);
      });
    }
  }
  expect(bad).toEqual([]);
});

test('no heading is narrower than its longest word', async ({ page }) => {
  /* German compounds are long, and global.css sets overflow-wrap: break-word on
     headings — so any heading whose box is narrower than its longest word gets that
     word snapped mid-syllable with no hyphen. It shipped on the feature tile, where a
     34ch measure meant for 15px body text also capped a 40px heading:
     "Treppenhausre | inigung" inside a 900px tile. hyphens: auto is not a fix, since
     it needs a hyphenation dictionary the browser may not carry. */
  const bad: string[] = [];

  for (const width of [380, 924, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/leistungen', '/ueber-uns', '/kontakt']) {
      await page.goto(route);
      const hits = await page.evaluate(() => {
        const probe = document.createElement('span');
        probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;left:-9999px';
        document.body.appendChild(probe);

        const out: string[] = [];
        for (const el of document.querySelectorAll<HTMLElement>('h1, h2, h3')) {
          const text = (el.textContent ?? '').trim();
          if (!text) continue;
          const rect = el.getBoundingClientRect();
          if (rect.width < 1) continue;

          const cs = getComputedStyle(el);
          probe.style.font = cs.font || `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
          probe.style.letterSpacing = cs.letterSpacing;

          const longest = text.split(/\s+/).reduce((a, b) => (b.length > a.length ? b : a), '');
          probe.textContent = longest;
          const needed = probe.getBoundingClientRect().width;

          // The content box, minus padding, is what the word actually has to fit in.
          const avail =
            rect.width - parseFloat(cs.paddingLeft || '0') - parseFloat(cs.paddingRight || '0');

          // 1px of slack for sub-pixel rounding.
          if (needed > avail + 1) {
            out.push(`${el.tagName.toLowerCase()}.${[...el.classList][0] ?? ''} "${longest}" needs ${Math.round(needed)}px, has ${Math.round(avail)}px`);
          }
        }
        probe.remove();
        return [...new Set(out)];
      });
      for (const h of hits) bad.push(`${width}px ${route}: ${h}`);
    }
  }

  expect(bad).toEqual([]);
});

test('no two sections on a page claim the same number', async ({ page }) => {
  /* /kontakt counted 01, 02, 02: the enquiry card and the Timeline both claimed 02,
     because Timeline hard-coded its own kicker instead of taking it from the page.
     The numbers are a navigational device — a repeat makes the page look unproofed.
     Only section kickers count; .co-kicker__num--item indexes rows in a catalogue. */
  const bad: string[] = [];

  for (const route of ['/', '/leistungen', '/ueber-uns', '/kontakt', '/impressum', '/datenschutz']) {
    await page.goto(route);
    const numbers = await page.evaluate(() =>
      [...document.querySelectorAll('.co-kicker__num:not(.co-kicker__num--item)')].map((el) =>
        (el.textContent ?? '').trim(),
      ),
    );

    const seen = new Map<string, number>();
    for (const n of numbers) seen.set(n, (seen.get(n) ?? 0) + 1);
    for (const [n, count] of seen) {
      if (count > 1) bad.push(`${route}: section number ${n} used ${count} times`);
    }

    // They should also read in order, which is the point of numbering them at all.
    const sorted = [...numbers].sort();
    if (numbers.join() !== sorted.join()) {
      bad.push(`${route}: section numbers out of order — ${numbers.join(', ')}`);
    }
  }

  expect(bad).toEqual([]);
});

test('the FAQ answers are reachable without JavaScript', async ({ browser }) => {
  /* CLAUDE.md rule 10: content must never depend on a script to be visible. The FAQ is
     a <details> for exactly this reason — and its answers are also the FAQPage markup,
     so an answer a visitor cannot open would be a rich result built on text that is
     not on the page. */
  const ctx = await browser.newContext({ viewport: { width: 924, height: 800 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/leistungen');

  const items = page.locator('.faq__item');
  const count = await items.count();
  expect(count, 'FAQ entries on /leistungen').toBeGreaterThan(3);

  // Closed to begin with, so the section stays scannable.
  await expect(items.first().locator('.faq__a')).toBeHidden();

  // Opening is a browser behaviour, not a scripted one.
  await items.first().locator('.faq__q').click();
  await expect(items.first().locator('.faq__a')).toBeVisible();
  expect((await items.first().locator('.faq__a').textContent())?.trim().length ?? 0).toBeGreaterThan(40);

  await ctx.close();
});
