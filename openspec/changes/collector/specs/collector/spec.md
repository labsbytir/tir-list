# Spec Delta

## Purpose
Collected entries MUST match hand-written ones and MUST exit only via the Webshare proxy with per-link sessions.

## ADDED Requirements

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
