# Design

## Approach
- Schema additions all optional; validator checks shapes loosely (types + http(s) URLs).
- `enrich.mjs`: proxy-gated like collect (per-repo session), 1s delay, failures tolerated per repo. Changelog hunt: CHANGELOG.md → HISTORY.md → CHANGELOG.rst → CHANGELOG.txt on default branch. Traffic views tried, null on 403. `statsHistory` capped at 120 points.
- Detail route `[category]/[slug].astro` with `getStaticPaths` from the same glob; prerendered at build (works on Cloudflare adapter).
- `StarsHistory.tsx`: Recharts LineChart (client:load), brand colors. `ActivityHeatmap.astro`: pure SVG 52×7 grid (Recharts ships no heatmap; custom SVG is smaller and themeable).
- PGlite: `raw JSONB` column + sync carries full entry.
- llms: per-entry `public/<category>/<slug>.txt` via generate-llms; cards retitle-link to detail pages.

## Alternatives
- Star-history backfill via stargazers timeline: rejected (thousands of paginated calls on popular repos).
- Recharts ScatterChart-as-heatmap: rejected, custom SVG is exact and dependency-free.
