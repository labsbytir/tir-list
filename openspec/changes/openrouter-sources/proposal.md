# Proposal

## Why
Models, benchmarks, token usage, and app rankings currently come from nowhere; OpenRouter exposes them as JSON APIs (models list is keyless; benchmarks + rankings-daily need a key).

## What Changes
- Collector: `openrouter-models` (→ models, keyless, embeds AA/design-arena benchmarks + pricing/specs), `openrouter-apps` (→ tools, parses /apps JSON-LD + cards, token counts), `OPENROUTER_API_KEY` for keyed calls
- Enrich: rankings-daily → `usageHistory` on entries with `permaslug`
- Schema: `permaslug`, `specs`, `benchmarks`, `usageHistory` (validator + templates + CONTRIBUTING)
- Model detail pages: specs grid, benchmark tables with attribution, usage chart; llms per-entry files gain benchmark lines

## Capabilities (new)
- `openrouter-sources`

## Impact
- Additive; benchmarks/usage render only when present; attribution footers included (AA + OpenRouter CC BY 4.0)
