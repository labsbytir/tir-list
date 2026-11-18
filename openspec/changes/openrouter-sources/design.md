# Design

## Approach
- `collect.mjs`: `openrouter-models` (public `/api/v1/models`, skip `:batch` by default, cap via limit); `openrouter-apps` (JSON-LD ItemList + card regex on `/apps` HTML, decode `/apps/url/` links, tokens → `stats.tokens`).
- `enrich.mjs`: keyed `rankings-daily?period=week` → match `permaslug` (exact or variant prefix) → `usageHistory` (cap 90). No key → skip with warning (benchmarks already ride along from collect).
- Schema: `permaslug` string; `specs`/`benchmarks` objects; `usageHistory` array ≤90. Validator: shapes only.
- Detail page: specs grid, AA index table + design-arena table, usage BarChart, attribution footnote. llms per-entry: append benchmark/spec lines.

## Alternatives
- Unified `/benchmarks` endpoint in enrich: rejected for now (models API already embeds AA + design-arena; saves rate budget).
- Scraping /models HTML: rejected, JSON API is complete.
