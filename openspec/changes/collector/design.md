# Design

## Approach
- `collect.mjs`: `--dry-run` (plan only), `--overwrite`, polite 1s delay, `tir-list-collector` UA. GitHub topics via search API (`GITHUB_TOKEN` optional, higher rate). Awesome-lists via raw markdown bullet parse (`* [name](url) - desc`).
- Proxy: `undici` ProxyAgent from `WEBSHARE_PROXY` (`http://user:pass@host:port`); per link, append `-session-<slug>` to the username for rotation/analytics.
- Slug from repo/name, dedupe per category, skip existing; write files, then exec validation.
- Templates: one skeleton JSON per category (JSON chosen: site serves JSON via glob, validator is JSON, no frontmatter parser needed).

## Alternatives
- Markdown entries: rejected, would need a parser + validator rewrite for zero gain.
- Headless browser: rejected, sources are API + static markdown.
