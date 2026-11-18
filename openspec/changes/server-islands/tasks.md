# Tasks

## 1. Home catalog island

- [ ] 1.1 In `src/pages/index.astro`, replace the inline column loop with one `<CatalogGrid server:defer>` that receives the six columns as a serializable prop, and give it fallback content. Verify: `npm run build` succeeds and the built page HTML contains the fallback, not the cards.
- [ ] 1.2 Move the home search script so it reads the cards after the island swaps in, not only on first paint. Verify: typing in the search box filters cards after the columns appear.

## 2. Listing island

- [ ] 2.1 In `src/pages/[category]/[slug].astro`, render `Listing` inside a `server:defer` island instead of `client:load`, passing the same plain props. Leave `StarsHistory`, `ViewsHistory`, `UsageHistory`, and `Discussion` on their client directives. Verify: `npm run build` succeeds and the listing HTML contains the fallback, not the listing body.
- [ ] 2.2 Confirm the island route sets no custom `Cache-Control` header. Verify: `curl -D -` against the built island route returns 200, not 400.

## 3. Check

- [ ] 3.1 Run `npm run build` and load `/` and one listing page. Verify: the shell paints, the fallback shows, then the catalog replaces it.
