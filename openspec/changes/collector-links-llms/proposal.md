# Proposal

## Why
Collected entries carry a single URL; we also want website/docs/GitHub links. And every catalog page should ship an LLM-readable file (`llms.txt` convention — `llms.md` isn't the standard filename).

## What Changes
- Optional `links: { website?, docs?, github? }` on entries: validator, templates, collector (GitHub topic `homepage` → website, `html_url` → github), sync script, CONTRIBUTING, card footer renders GitHub/Docs links
- `scripts/generate-llms.mjs` (`npm run generate:llms`, `prebuild` hook): `public/llms.txt` (whole catalog) + `public/llms/<category>.txt`

## Capabilities

### New Capabilities
- `entry-links`: optional website/docs/github links per entry
- `llms-txt`: generated LLM-readable catalog files

### Modified Capabilities
(none)

## Impact
- Schema is backward compatible (links optional); old entries untouched
