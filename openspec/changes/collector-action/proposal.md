# Proposal

## Why
Listings go stale without runs; Collector should run on a schedule in GitHub Actions and commit results back, authenticated by repo secrets.

## What Changes
- `.github/workflows/collector.yml`: weekly + manual runs of collect → enrich → validate → llms → build, committing `catalog/` + `public/llms*` back
- Secrets used: `WEBSHARE_PROXY`, `OPENROUTER_API_KEY` (plus auto `GITHUB_TOKEN`); documented in DEPLOY.md

## Capabilities (new)
- `collector-action`

## Impact
- No site code change; DuckDB explicitly not adopted (PGlite + JSON files already cover OLTP mirror + static source of truth)
