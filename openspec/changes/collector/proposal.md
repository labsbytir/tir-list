# Proposal

## Why
Catalog is hand-edited; user wants `collector/`, a custom scraper seeding entries from GitHub topics and awesome-lists, JSON templates per listing type, all traffic through Webshare proxy with a fresh session per link (analytics), writing directly to `catalog/`.

## What Changes
- `collector/collect.mjs` (`npm run collect`): source defs → proxy fetch → parse → write `catalog/<category>/<slug>.json` → run validation
- `collector/sources.json`: GitHub-topic + awesome-list seeds per category
- `collector/templates/<category>.json` + README: entry skeletons (JSON — matches site pipeline, validator, and glob loading)
- Proxy gate: `WEBSHARE_PROXY` required (refuse without it unless `--direct`); per-link `session-<slug>` rotation; polite delay + UA

## Capabilities

### New Capabilities
- `collector`: proxy-gated scraper writing catalog entries

### Modified Capabilities
(none)

## Impact
- New dep `undici` (ProxyAgent); no site behavior change; new entries flow through existing validation
