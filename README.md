# Nasha — DJ Portfolio

A standalone Vite + React port of the Claude Design handoff bundle for **Nasha**, a Chilean reggaetón DJ based in Amsterdam. Content is editable through a built-in CMS (`/admin`) so non-developers can update copy, add mixes/gigs, and upload photos without touching code.

## Quick start

```sh
npm install
npm run dev    # just the site
npm run cms    # site + CMS editor (open http://localhost:5173/admin)
```

## Editing content

There are two ways to edit, depending on the situation.

### Locally (developer / quick changes)

```sh
npm run cms
```

Opens both the site (`localhost:5173`) and the CMS (`localhost:5173/admin`). Edits hit the local filesystem — JSON files in `content/` and images in `public/uploads/`. Commit + push when happy.

### Online (Nasha, from any browser, no terminal)

Once deployed (see "Deploy" below), Nasha goes to `https://nasha.fm/admin`, signs in with GitHub, and edits through the same UI. Saving commits to the repo and triggers an auto-rebuild — site updates in ~1 minute.

## What lives where

```
content/                ← editable content (CMS reads/writes here)
  site.json             — name, tagline, bio, links, portrait images
  tags.json             — genre tags
  gallery.json          — press photos
  press.json            — quotes, technical rider, fact sheet
  mixes/*.json          — one file per mix
  gigs/*.json           — one file per gig

public/uploads/         ← photos uploaded via the CMS

src/
  App.jsx               — root, theme/accent wiring, Tweaks panel
  content.js            — aggregates all JSON into the shape components expect
  styles.css            — design tokens (colors, fonts) + dark/light themes
  nasha/
    Rest.jsx            — DeckA wrapper, Nav, Mixes/Gigs/About/Booking
    HomeFull.jsx        — full-deck home (mixer, faders, knobs)
    HomeMin.jsx         — minimalist home (knob = font weight, fader = tracking)
    extras.jsx          — MixDetail modal
    widgets.jsx         — Knob, Fader, VU, Waveform, LCD, etc.
  tweaks/
    TweaksPanel.jsx     — floating panel (variant, theme, accent, density)

public/admin/           ← Decap CMS UI
cf-oauth-worker/        ← Cloudflare Worker for GitHub auth (production /admin)
```

## Build

```sh
npm run build
npm run preview
```

`dist/` is a static bundle — drop it on any host.

## Deploy (Cloudflare Pages)

1. **Push to GitHub.** Create a new repo and push:
   ```sh
   git remote add origin git@github.com:YOUR-USER/nasha-portfolio.git
   git push -u origin main
   ```

2. **Connect to Cloudflare Pages.** Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → pick the repo. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: 20

3. **Set up GitHub OAuth for `/admin`.** Follow `cf-oauth-worker/README.md`. ~10 minutes total: create GitHub OAuth App → deploy worker → set 2 secrets → flip `config.yml` from `local_backend` to `github`.

4. **Invite Nasha** to the GitHub repo as a collaborator. She can then log into `/admin` with her own GitHub account.

## Tweaks panel

A small ◉ TWEAKS button sits in the bottom-right corner. Open it to swap home variant, theme (light/dark), accent color, density, and visibility of the live ticker / mixer block. Selections persist in `localStorage`.

Built from a Claude Design prototype.
