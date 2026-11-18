# Collector templates

One skeleton JSON per listing type. JSON (not markdown): the site loads `catalog/` via `import.meta.glob`, and `npm run validate:data` checks JSON — markdown would need a parser and validator rewrite for zero gain.

Copy a template to `catalog/<category>/<slug>.json`, fill it in:

- `slug`: kebab-case, must match the filename, unique within its folder
- `name`, `description` (one line), `url` (`https://…`, the tool's home)
- `tags`: non-empty array of lowercase tags
