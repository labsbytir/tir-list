# Design

## Context

See proposal.md for why. The site is Astro 7, `output: 'server'`, `@astrojs/node` in standalone mode, pages prerendered. `@astrojs/react` is already in `astro.config.mjs`. The home columns render `CatalogGrid.astro` inline. The listing body is `Listing.tsx` with `client:load`. Charts use `client:load` and comments use `client:visible`. An earlier `server:defer` island returned 400 because Caddy overwrote the response's cache header.

## Goals / Non-Goals

**Goals:**

- Paint the shell, then fill the catalog through `server:defer`.
- Keep the listing body as a React component, rendered on the server inside the island.
- Make the island request succeed through Caddy.

**Non-Goals:**

- Changing the adapter, the host, or the deploy workflow.
- Moving charts or comments onto a server island. They need the browser.
- Redesigning the visual layout, fonts, or colors.

## Decisions

1. **One island per page, not one per column.** The home passes the six columns as one serializable prop to `CatalogGrid` and defers that single component. Six islands would be six requests for data that is already in memory. Alternative rejected: per-column islands, more requests, no faster first paint.

2. **React stays, and it renders on the server.** `Listing.tsx` moves from `client:load` to a server island. `@astrojs/react` server-renders it, so the browser does not download React for the listing body. Charts and comments keep their client directives. Alternative rejected: rewriting `Listing.tsx` as Astro, which throws away the MUI component for no gain.

3. **Props are plain data.** The page builds the column list and the listing props in the frontmatter and passes the result. No functions, no class instances.

4. **The island response must not set a cache header Caddy rewrites.** The 400 came from a `Cache-Control` value the proxy replaced. The island route uses the adapter default and does not set its own cache header. If the 400 returns, the fix is in the Caddyfile (a plain `reverse_proxy`, which it already is) rather than a new header.

## Risks / Trade-offs

- [Island request 400s again behind Caddy] → Confirm the response has no custom cache header, then check the Caddyfile is still a plain reverse proxy. The fallback stays visible if it fails.
- [Search script runs before the grid exists] → The home filter script must run after the island swaps in, or re-query the cards when they appear. The grid is not in the first HTML.
- [Two React runtimes on a listing page] → Charts stay client islands. Acceptable: they are small and already hydrate. Do not hydrate the listing body.

## Migration Plan

Ship behind the existing deploy workflow: push to `main`, the workflow builds and purges Cloudflare. Rollback is reverting the two pages to inline rendering. No data migration.

## Open Questions

None.
