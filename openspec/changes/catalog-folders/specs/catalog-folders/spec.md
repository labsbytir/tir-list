# Spec Delta

## Purpose
Catalog content MUST live as one JSON file per entry under `catalog/<category>/` for Skills, Models, Containers, Servers, Agents, and Tools.

## ADDED Requirements

### Requirement: Folder layout
Each of the six category folders MUST exist with one `<slug>.json` per entry; every page section MUST render from these files.

#### Scenario: Browse all six
- **WHEN** a visitor loads `/`
- **THEN** nav, tabs, chart, and grid cover Skills, Models, Containers, Servers, Agents, and Tools

### Requirement: Validated entries
Validation and CONTRIBUTING MUST reference the folder layout and reject bad entries.

#### Scenario: Invalid entry
- **WHEN** a `catalog/*/*.json` file misses a field, duplicates a slug, or has a non-http(s) URL
- **THEN** `npm run validate:data` fails naming the file
