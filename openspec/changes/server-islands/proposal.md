# Proposal

## Why

The home catalog and the listing body render in one static pass, so the shell cannot paint until every card is built. An earlier attempt used `server:defer` and was removed because the island request returned 400 behind Caddy. The site now runs on `@astrojs/node` with `@astrojs/react` already installed, and the catalog still has no deferred island. The shell should paint first and the catalog should fill in after it.

## What Changes

- Render the home catalog columns as one deferred server island, with visible fallback content until the cards arrive.
- Render the listing body (facts, verdict, pricing, built-with, install) as a React component inside a deferred server island. Charts and the comment thread stay client islands, because they need the browser.
- Pass only JSON-serializable props across the island boundary.
- Keep the Node standalone adapter. Do not switch the deploy target.
- Fix the island response so Caddy does not turn it into a 400. The earlier failure was a cache header the proxy overwrote.

## Capabilities

### New Capabilities

- `catalog-islands`: the catalog shell paints immediately and the catalog body arrives as a deferred server island.

### Modified Capabilities

(none)

## Impact

- `src/pages/index.astro` and `src/pages/[category]/[slug].astro` gain `server:defer` islands. Both pages stay prerendered shells.
- `src/components/CatalogGrid.astro` becomes the deferred home island. `src/components/Listing.tsx` stays the listing body and moves onto a server island.
- `@astrojs/react` and `@astrojs/node` stay. No new adapter.
- Auth, comments, and the collector are untouched.
