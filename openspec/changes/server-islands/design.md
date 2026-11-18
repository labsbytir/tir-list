# Design

## Approach
- Adapter `@astrojs/cloudflare`, `output: 'server'`, page sets `export const prerender = true` (prerendered shell + on-demand island, per server-islands guide).
- New `src/components/CatalogGrid.astro` takes `categories` prop (serializable), renders the card grid.
- `index.astro` keeps header/controls, uses `<CatalogGrid categories={categories} server:defer>` with `<p slot="fallback">Loading catalog…</p>`.
- Client-side search/filter script stays as-is (operates on rendered grid).

## Alternatives
- Full SSR page (no prerender): rejected, slower TTFB for static data.
- Client framework island: rejected, user asked for server islands, no framework wanted in v1.
