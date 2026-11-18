# Proposal

## Why
Catalog data lives in four JSON blobs under `src/data/`; user wants a `Catalog/` folder with subfolders per kind (Skills, Models, Containers, Servers, Agents, Tools) — one file per entry, fewer merge conflicts, clearer fork-PR flow.

## What Changes
- New `catalog/<category>/<slug>.json`, one file per entry; migrate existing entries; add Agents and Tools seeds
- Page loads entries via `import.meta.glob`; category IDs become `skills models containers servers agents tools`
- Validation script and CONTRIBUTING updated to the folder layout; `src/data/` removed

## Capabilities

### New Capabilities
- `catalog-folders`: folder-based catalog content (one file per entry)

### Modified Capabilities
(none)

## Impact
- Content move + `index.astro` loading, `scripts/validate-data.mjs`, `CONTRIBUTING.md`
- Old category IDs (`mcp-servers`, `ai-models`, `linux-flavors`) replaced; search/island/chart code unchanged
