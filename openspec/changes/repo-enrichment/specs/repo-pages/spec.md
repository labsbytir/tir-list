# Spec Delta

## Purpose
Repo-backed entries MUST expose stars, releases, changelog, and activity history, rendered on per-entry detail pages with graphs.

## ADDED Requirements

### Requirement: Enriched repo data
Entries with a GitHub repo MUST be enrichable with stars, forks, watchers, license, latest releases, changelog excerpt, and 52-week commit activity.

#### Scenario: Enrich run
- **WHEN** `npm run collect:enrich` runs with proxy + optional token
- **THEN** repo entries gain `stats`/`releases`/`changelog`/`activity`, history appended, validation still passes

### Requirement: Detail pages
Every entry MUST have a prerendered `/{category}/{slug}` page with header stats, links, releases, changelog, stars graph, and activity heatmap (repo entries) plus its own `llms.txt`.

#### Scenario: Model page
- **WHEN** a visitor opens a model entry page
- **THEN** specs, graphs, releases, and changelog render from entry data
