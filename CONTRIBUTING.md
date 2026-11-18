# Contributing to tir-list

Add a tool to the catalog by forking and opening a pull request.

## Steps

1. Fork this repo, then clone your fork.
2. Create a branch: `git checkout -b add-<tool-slug>`.
3. Add one file per entry under `catalog/`:
   - `catalog/skills/<slug>.json` — Skills
   - `catalog/models/<slug>.json` — Models
   - `catalog/containers/<slug>.json` — Containers
   - `catalog/servers/<slug>.json` — Servers
   - `catalog/agents/<slug>.json` — Agents
   - `catalog/tools/<slug>.json` — Tools
4. Entry schema (the filename must match `slug`, which is unique within its folder, `links` optional but validated when present):

   ```json
   {
     "slug": "my-tool",
     "name": "My Tool",
     "description": "One line on what it does.",
     "url": "https://example.com/",
     "tags": ["tag-one", "tag-two"],
     "links": {
       "website": "https://example.com/",
       "docs": "https://example.com/docs",
       "github": "https://github.com/example/repo"
     }
   }
   ```

5. Validate: `npm run validate:data`.
6. Commit, push, and open a PR against `main`. CI runs the same validation.

Maintainers refresh GitHub stats with `npm run collect:enrich` (needs `WEBSHARE_PROXY`, optional `GITHUB_TOKEN`); it fills `stats`, `releases`, `changelog`, and `activity` on repo-backed entries.

## Rules

- One entry per PR keeps review fast.
- `url` must be `http(s)` and point at the tool's home, not an affiliate or redirect link.
- No duplicates: search the catalog first.
- Collector-managed fields (`repo`, `stats`, `statsHistory`, `releases`, `changelog`, `activity`, `views`, `permaslug`, `specs`, `benchmarks`, `usageHistory`) are filled by `npm run collect` / `npm run collect:enrich` — don't hand-edit them.
