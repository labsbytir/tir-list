# Spec Delta

## Purpose
Collector verbiage rename: scraped/scrape wording → collected/collect.
Normative behavior is unchanged; only the words describing the
fetch-and-write pipeline are updated.

## MODIFIED Requirements

### Requirement: Template-conformant output
Every collected entry MUST validate against its category template and `npm run validate:data`.

#### Scenario: Collect run
- **WHEN** `npm run collect` finishes
- **THEN** new `catalog/<category>/<slug>.json` files exist, conform to schema, and validation passes; existing files are untouched without `--overwrite`

### Requirement: Proxy gate + per-link session
No collect fetch may bypass the proxy; each link MUST use a fresh `session-<slug>` so Webshare analytics attribute traffic per link. Missing `WEBSHARE_PROXY` MUST abort unless `--direct` is passed.

#### Scenario: No proxy configured
- **WHEN** run without `WEBSHARE_PROXY` and without `--direct`
- **THEN** the run aborts before any fetch
