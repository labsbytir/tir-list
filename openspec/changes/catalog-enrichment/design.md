# Design

## Approach
- `normUrl` (host + path, no www/trailing slash; GitHub URLs collapse to owner/repo) backs a known-URL set seeded from `catalog/` plus everything written this run.
- Emoji maps stay inside the punkpeye parser; GitHub topics flow through `collectSource`.
- Icons resolve at render from the entry URL host; `onerror` hides, initial-letter fallback when hostless.

## Alternatives
- Stored favicon files: rejected, binary bloat in git for hundreds of entries.
