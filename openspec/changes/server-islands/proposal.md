# Proposal

## Why
Catalog page renders everything in one static pass; user wants Astro server islands (`server:defer`) so the grid streams in after the shell, per https://docs.astro.build/en/guides/server-islands/.

## What Changes
- Install `@astrojs/cloudflare` adapter, switch to `output: 'server'` with page prerendered
- Extract `src/components/CatalogGrid.astro`, render via `<CatalogGrid server:defer>` with fallback content
- Serializable props only (plain JSON data)

## Capabilities

### New Capabilities
- `catalog-islands`: catalog grid loads as a deferred server island with fallback

### Modified Capabilities
(none)

## Impact
- New dep `@astrojs/cloudflare`; `astro.config.mjs` gains adapter + `output: 'server'`
- `index.astro` keeps `export const prerender = true` (static shell, deferred island)
- Deploy target becomes Cloudflare with adapter instead of plain static `dist/`
