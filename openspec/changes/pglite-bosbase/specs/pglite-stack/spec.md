# Spec Delta

## Purpose
The repo MUST persist listings in PGlite (never Postgres), sync them to Bosbase on demand, and run on Debian 13 without Docker.

## ADDED Requirements

### Requirement: PGlite persistence
`src/lib/db.ts` MUST expose a lazy PGlite database with pgvector and `listings`, `roles`, `comments`, `rates` tables.

#### Scenario: Cold start
- **WHEN** server code first queries the DB
- **THEN** PGlite initializes from `PGLITE_DIR` (default `./data/pglite`) with extensions and schema ready

### Requirement: Bosbase sync
`npm run sync:bosbase` MUST upsert every `catalog/*/*.json` entry locally and push to `${BOSBASE_URL}/api/listings` when `BOSBASE_API_KEY` is set, skipping the push with a warning otherwise.

#### Scenario: Sync without key
- **WHEN** run without `BOSBASE_API_KEY`
- **THEN** local upsert succeeds and the script exits 0 with a skip warning

### Requirement: No-Docker deploy
`DEPLOY.md` MUST describe Debian 13 minimal install with Node 24, systemd, and Caddy, and no Docker step.

#### Scenario: Fresh Debian box
- **WHEN** staff follows DEPLOY.md on 150.241.230.243
- **THEN** the site runs without installing Docker
