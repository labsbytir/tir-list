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
4. Entry schema (the filename must match `slug`, which is unique within its folder):

   ```json
   {
     "slug": "my-tool",
     "name": "My Tool",
     "description": "One line on what it does.",
     "url": "https://example.com/",
     "tags": ["tag-one", "tag-two"]
   }
   ```

5. Validate: `npm run validate:data`.
6. Commit, push, and open a PR against `main`. CI runs the same validation.

## Rules

- One entry per PR keeps review fast.
- `url` must be `http(s)` and point at the tool's home, not an affiliate or redirect link.
- No duplicates: search the catalog first.
