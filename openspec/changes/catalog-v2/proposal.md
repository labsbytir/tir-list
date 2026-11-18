# Proposal

## Why
Catalog is browse-only. Ten features turn it into a working directory: machine API, leaderboards, trending, digest, deeper search, compare, submit form, install commands, link health, and comments.

## What Changes
1. `GET /api/catalog.json` (prerendered, full catalog)
2. `/leaderboard` (stars per category + overall)
3. `/trending` (star velocity from statsHistory)
4. `/fresh` (latest releases digest)
5. Search: tag filter + min-stars + sort (name/stars/updated)
6. `/compare?a=&b=` side-by-side table from embedded JSON
7. `/submit` form → prefilled GitHub new-file PR flow
8. Optional `install {label, command}` per entry + copy button on detail pages
9. `collector/health.mjs` (`collect:health`, `--check`) + weekly CI
10. Comments: PGlite-backed storage via fuma-comment server + UI island, Bosbase auth adapter as the single pending seam

## Capabilities (new)
- `machine-api`, `leaderboard`, `trending`, `fresh-digest`, `search-filters`, `compare`, `submit-form`, `install-commands`, `link-health`, `comments`

## Impact
- Additive pages/scripts; entry schema gains optional `install`; no existing behavior removed
- Comments ship wired to storage with auth stubbed to Bosbase pending endpoint confirmation
