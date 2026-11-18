# Design

## Approach
- `collector.yml`: cron weekly Sunday 06:00 UTC + `workflow_dispatch` (with `overwrite` boolean). `permissions: contents: write`. Steps: checkout, node 24, `npm ci`, collect → enrich → validate → llms → build, then commit-if-changed via `git status --porcelain` and push (GITHUB_TOKEN).
- Secrets: `WEBSHARE_PROXY` (proxy gate), `OPENROUTER_API_KEY` (usage history), `GITHUB_TOKEN` auto-provided for rate limits. No new secrets needed for commit-back.
- DuckDB rejected: listings source of truth is git-tracked JSON (diffable, PR-reviewable); PGlite is the OLTP mirror (comments, sync). DuckDB is OLAP — right tool for analytics queries we don't run.

## Alternatives
- PR-based updates instead of direct push: rejected, noisy; validation already gates quality.
