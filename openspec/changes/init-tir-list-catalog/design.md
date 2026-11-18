# Design

## Approach

Astro v7 static (`output: 'static'`), TypeScript strict. Single `src/pages/index.astro` renders all cards server-side; filtering is a small inline `<script>` (no framework). Data lives in `src/data/*.json` with `{ slug, name, description, url, tags }`.

## Astro v7 notes (from migration guide)

- Vite 8 inside; no Vite-specific config for v1.
- Rust compiler is strict: all non-void tags closed, no invalid nesting (e.g. `<div>` in `<p>`).
- Default Markdown processor Sätteri — unused in v1 (JSON data only).
- Default `compressHTML: 'jsx'` — inline elements joined without spaces unless explicit `{" "}`; inspected, no inline-element sentence flow in v1.

## Alternatives

- Vite vanilla: dropped per user Astro v7 request.
- Content collections: deferred until catalog grows beyond JSON.
