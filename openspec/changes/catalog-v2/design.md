# Design

## Approach
- Batch A (read-only data pages): `src/pages/api/catalog.json.ts` (prerendered), `/leaderboard`, `/trending`, `/fresh` — all from the catalog glob; velocity = (last-first)/days; empty states where enrich data is absent.
- Batch B (interaction): search script gains tag select + min-stars + sort; `/compare.astro` client-renders from embedded JSON via `?a=&b=`; `/submit.astro` builds GitHub `new/main?filename=&value=` URL; `install` schema + detail copy block.
- Batch C (ops + comments): `collector/health.mjs` reuses proxy gate (HEAD→GET fallback, timeout), `--check` for CI, weekly workflow; comments via fuma-comment server Hono adapter mounted in an Astro API route on PGlite+Drizzle storage, auth stub → Bosbase.
- Validator extended once for `install`; health report gitignored.

## Alternatives
- Prerendered compare pairs: rejected (combinatorial); query-driven single page.
- Server-side submit PR creation: rejected (needs user OAuth); GitHub prefill keeps auth with the user.
