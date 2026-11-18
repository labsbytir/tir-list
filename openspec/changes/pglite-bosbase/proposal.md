# Proposal

## Why
No database exists; Postgres is rejected in favor of PGlite. Staff backend and auth live in Bosbase (https://www.bosbase.com/); this repo must push listings there. Comments (fuma-comment) need storage and a Bosbase auth adapter that don't exist yet.

## What Changes
- `src/lib/db.ts`: PGlite singleton + pgvector, listings + fuma-comment-shaped tables (roles/comments/rates)
- `src/lib/bosbase.ts` + `scripts/sync-bosbase.mjs` (`npm run sync:bosbase`): upsert catalog into PGlite, push to Bosbase when `BOSBASE_API_KEY` is set
- `DEPLOY.md`: Debian 13 minimal, no-Docker runbook (Node 24, systemd, Caddy, env)
- `.env.example`, `data/` gitignored

## Capabilities

### New Capabilities
- `local-db`: PGlite persistence seam with listings mirror
- `bosbase-sync`: push catalog listings to Bosbase
- `debian-deploy`: no-Docker Debian 13 runbook

### Modified Capabilities
(none)

## Impact
- New deps: `@electric-sql/pglite`, `-pgvector`, `-socket`; no site behavior change
- fuma-comment UI deferred until Bosbase auth endpoint is confirmed (storage tables ready)
