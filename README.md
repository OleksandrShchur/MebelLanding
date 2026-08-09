# Mebel Store - Furniture Landing Page

A responsive React + TypeScript furniture store landing page with a magazine-style product viewer. Pages are **prerendered at build time** (static HTML + hydration) for fast first paint on Cloudflare’s free tier.

## Features

- **Prerendered routes**: `/`, `/terms`, and catalog deep links ship as static HTML
- **Responsive Design**: Mobile-first layout with breakpoints for mobile (< 768px), tablet (768px - 1024px), and desktop (> 1024px)
- **Hero**: Full-bleed hero with brand-forward messaging
- **Categories Grid**: Interactive category cards
- **Magazine Viewer**: Fullscreen modal with page-flipping animation (client-only)
- **Lazy Loading**: Catalog page images load on demand
- **Keyboard Navigation**: ESC to close modal, arrow keys for navigation

## Tech Stack

- React 19
- TypeScript
- React Router 7 (framework mode, `ssr: false` + prerender)
- Vite
- Tailwind CSS
- react-pageflip
- Cloudflare Workers Static Assets (Wrangler)

## Getting Started

### Prerequisites

- Node.js 20+ (22+ recommended)
- npm
- Catalog images at `public/images/catalogs` (gitignored; required for a full local preview)

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build

```bash
npm run build
```

Output: `build/client` (prerendered HTML, assets, and copied `public/` files).

### Deploy (Cloudflare free tier)

```bash
npm run deploy
```

This runs `react-router build` then `wrangler deploy`. Static assets are served from the edge with **no per-request Worker SSR**, so HTML/image traffic does not consume the free Worker request quota.

**Free-tier limits to stay under:**

- ≤ 20,000 files per Worker version
- ≤ 25 MiB per individual file
- Catalog WebPs stay same-origin under `/images/catalogs/...` (include them in the deploy machine/CI; they are not in git)

Optional GitHub Pages deploy of the static client build:

```bash
npm run deploy:gh-pages
```

## Project Structure

```
app/
├── components/     # UI (Home, hero, catalogs, flipbook modal, …)
├── data/           # Categories + store contact
├── hooks/
├── lib/gallery.ts  # Manifest normalize + loaders
├── routes/         # Framework routes + loaders
├── root.tsx
└── routes.ts
public/
├── gallery-manifest.json
├── _headers
└── images/
react-router.config.ts   # ssr:false + prerender paths
wrangler.jsonc           # Static assets deploy
```

## Cloudflare notes

- Prefer asset-first serving (this project has no SSR Worker `main`).
- Do not enable `run_worker_first` for HTML or `/images/*`.
- Long-cache headers for hashed `/assets/*` and catalog images are in `public/_headers`.
