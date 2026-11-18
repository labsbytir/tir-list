# Design

## Approach
- `catalog/{skills,models,containers,servers,agents,tools}/<slug>.json` with existing 5-field schema.
- `index.astro`: `import.meta.glob("../../catalog/*/*.json", { eager: true })`, group by folder, label map for display names.
- Validation walks `catalog/*/`; CONTRIBUTING updated to one-file-per-entry flow. Delete `src/data/`.

## Alternatives
- Markdown frontmatter: rejected, JSON keeps validator zero-dep and schema unchanged.
