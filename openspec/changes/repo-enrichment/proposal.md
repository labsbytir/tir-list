# Proposal

## Why
Repo-backed listings should show GitHub stars, releases, and changelog (fields mcp.directory-style pages carry), with historical star/view graphs and OpenRouter-style per-model detail pages. Recharts has no heatmap component, so repo activity gets a brand-styled SVG heatmap instead.

## What Changes
- Entry schema: optional `repo`, `stats`, `statsHistory`, `releases`, `changelog`, `activity` (validator accepts, templates document)
- `collector/enrich.mjs` (`npm run collect:enrich`): GitHub repo data, releases, changelog file hunt, commit activity, traffic views (token-with-access only, else null), snapshots appended to entry JSON
- Detail pages `src/pages/[category]/[slug].astro` (prerendered): hero, stats, links, releases, changelog, stars history (Recharts), activity heatmap (SVG), per-page `llms.txt`
- Cards link titles to detail pages; PGlite `listings.raw` carries full entry

## Capabilities

### New Capabilities
- `repo-enrichment`: GitHub stats/releases/changelog/activity on entries
- `entry-pages`: prerendered detail pages with graphs

### Modified Capabilities
(none)

## Impact
- New: enrich script, detail route, heatmap + stars components, per-page llms files
- Honest limits: views need a token with push access; star history starts at first enrich run (no paid backfill API)
