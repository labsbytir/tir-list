# Design

## Approach
- Validator: `links` optional object; only `website|docs|github` keys; values non-empty http(s) strings.
- Collector: GitHub topics set `url` = homepage-or-repo, `links.website` = homepage (when present), `links.github` = repo URL. Awesome-lists: single URL only.
- `generate-llms.mjs` reads `catalog/`, writes `public/llms.txt` + `public/llms/<category>.txt`; `prebuild` runs it so every build regenerates.
- Cards: footer gains GitHub/Docs anchors when present and different from `url`.

## Alternatives
- `llms.md`: rejected, the standard filename agents look for is `llms.txt`.
- Markdown entries for LLMs: rejected, generated files stay out of the content pipeline.
