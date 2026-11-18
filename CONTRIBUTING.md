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

## Listing detail metadata (optional)

Entries may add `details`, `categoryDetails`, and `evidence` objects (see `openspec/changes/listing-page-content/design.md` for the full dictionary and `src/lib/catalog.ts` for types). Rules:

- All new fields are optional; existing `name`, `description`, `about`, `features`, `tags`, `specs`, and link fields stay authoritative fallbacks. Sparse entries without new metadata remain valid.
- `categoryDetails` holds only the key matching the entry's folder (`skills`, `agents`, `containers`, `servers`, `models`, or `tools`).
- Unknown values render as "Not provided"; explicit `false`/`0` render as unsupported/zero, never as missing. Amount `0` still requires `currency` and `unit`.
- Every `details.setup.instructions` entry requires `sourceUrl`. Screenshot `details.media` entries require `alt`.
- Examples use placeholders such as `<YOUR_TOKEN>`; the validator rejects known live-secret patterns, but review is still required.
- Dates are ISO 8601 and never in the future. Verification identifies the checked fields — a timestamp alone never marks a listing verified.
- Run `npm run validate:data` (nested rules live in `src/lib/listing-contract.ts`) and `npm run test:contract` before opening a PR.

Collector ownership: `collector/collect.mjs` and `collector/enrich.mjs` only write collector-owned keys (`repo`, `stats`, `statsHistory`, `releases`, `changelog`, `activity`, `views`, `verdict`, `builtWith`, `features`, `pricing`, `about`, `sources`, `usageHistory`). They never assign `details`, `categoryDetails`, or `evidence` — hand-supplied metadata survives refresh. `tests/listing-contract.test.ts` guards this.

## Rules

- One entry per PR keeps review fast.
- `url` must be `http(s)` and point at the tool's home, not an affiliate or redirect link.
- No duplicates: search the catalog first.
- Collector-managed fields (`repo`, `stats`, `statsHistory`, `releases`, `changelog`, `activity`, `views`, `permaslug`, `specs`, `benchmarks`, `usageHistory`) are filled by `npm run collect` / `npm run collect:enrich` — don't hand-edit them.
