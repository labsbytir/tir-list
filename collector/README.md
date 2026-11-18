# Collector

tir-list's custom headless scraper. It fetches listing sources through the
Webshare proxy (every request exits via the proxy with a fresh per-link
session), parses them into catalog entries, and writes `catalog/<category>/<slug>.json`.

## Source types

- `github-topic` — GitHub repo search by topic (stars desc)
- `awesome-list` — generic `* [name](url) - description` markdown lists
- `awesome-punkpeye` — badge/emoji-heavy awesome lists with `###` section grouping
- `model-catalog` — JSON model index APIs (pricing, context, embedded benchmarks)
- `app-rankings` — ranked app pages (JSON-LD + cards, token counts)

## Usage

```bash
npm run collect -- --dry-run   # plan only, no fetching
npm run collect                # requires WEBSHARE_PROXY (refuses without it; --direct overrides)
npm run collect:enrich         # repo stats + usage history (needs GITHUB_TOKEN / provider keys)
npm run collect:health [--check]
```

New entries must pass `npm run validate:data`; existing files are left alone
unless `--overwrite` is given. See `templates/` for the per-category entry skeleton.
