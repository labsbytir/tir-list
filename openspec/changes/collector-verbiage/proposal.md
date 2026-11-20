# Proposal

## Why
The org-wide standard is now collector/collecting verbiage (GoNewsk,
Newsk, NewskData already renamed). tir-list's `collector/` directory was
named right, but its copy still says scraper/scrape in user-facing
strings, specs, and historical design notes.

## What Changes
- `collector/README.md`, `collector/collect.mjs`, `collector/enrich.mjs`:
  scraper/scrape copy → collector/collect (log/error strings only,
  no behavior change)
- `tests/listing-contract.test.ts`: fixture description "Scraped" →
  "Collected"
- `openspec/changes/collector/*`, `openspec/changes/collector-links-llms/*`,
  `openspec/changes/catalog-enrichment/*`,
  `openspec/changes/openrouter-sources/*`,
  `docs/superpowers/specs/2026-11-18-tir-list-design.md`: prose updated
  to collector verbiage (normative MUSTs preserved verbatim otherwise)

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `collector`: copy-only rename, behavior unchanged

## Impact
- No behavior, API, or serialized-format change; log strings only.
- Out of scope: repo renames, URL changes.
