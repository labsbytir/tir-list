# Contributing to tir-list

Add a tool to the catalog by forking and opening a pull request.

## Steps

1. Fork this repo, then clone your fork.
2. Create a branch: `git checkout -b add-<tool-slug>`.
3. Add your entry to the right file under `src/data/`:
   - `skills.json` — Skills
   - `mcp-servers.json` — MCP Servers
   - `ai-models.json` — AI Models
   - `linux-flavors.json` — Linux Flavors
4. Entry schema (`slug` is unique within its file):

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
