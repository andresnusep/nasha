// Aggregates JSON content files into the same shape as the legacy NASHA_DATA
// object the components expect. Editable via /admin (Decap CMS) or by hand.
//
// Vite's import.meta.glob with `eager: true` inlines every file at build time,
// so this is zero-runtime-cost — equivalent to writing one big object literal.

import site from '../content/site.json';
import press from '../content/press.json';
import tags from '../content/tags.json';
import gallery from '../content/gallery.json';

const mixModules = import.meta.glob('../content/mixes/*.json', { eager: true });
const gigModules = import.meta.glob('../content/gigs/*.json', { eager: true });

const collect = (mods, sortKey) =>
  Object.values(mods)
    .map((m) => m.default ?? m)
    .sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      return av < bv ? -1 : av > bv ? 1 : 0;
    });

const mixes = collect(mixModules, 'order');

// Date-based status: a gig is UPCOMING until midnight after its date, then
// becomes PLAYED. Compared against local midnight today so the cutover
// happens cleanly overnight. The manual `status` field in the JSON is
// ignored at runtime (kept in the schema for now as a future override).
export function gigStatus(g, today = new Date()) {
  const gigDate = new Date(g.year, g.month, g.day);
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return gigDate >= todayStart ? 'UPCOMING' : 'PLAYED';
}

// Gigs are listed UPCOMING-first (soonest), then PLAYED (most recent first).
const gigsRaw = Object.values(gigModules).map((m) => m.default ?? m);
const today = new Date();
const upcoming = gigsRaw
  .filter((g) => gigStatus(g, today) === 'UPCOMING')
  .sort((a, b) => a.year - b.year || a.month - b.month || a.day - b.day);
const played = gigsRaw
  .filter((g) => gigStatus(g, today) === 'PLAYED')
  .sort((a, b) => b.year - a.year || b.month - a.month || b.day - a.day);
const gigs = [...upcoming, ...played];

export const NASHA_DATA = {
  ...site,
  mixes,
  gigs,
  tags: tags.tags,
  gallery: gallery.items,
  press,
};
