# Design

## Approach
- Original CSS in `index.astro` (no framework): sticky blurred header, container, two-column main/sidebar collapsing to one column under 1024px, pill tabs, bordered cards, line-clamp via -webkit-box.
- `CatalogGrid.astro` emits the new card markup with `data-cat`, `data-key`; search script unchanged apart from wiring header nav + copy buttons + menu toggle.
- Sidebar: "Add your tool" card (3 steps, copyable fork/clone commands, PR link to labsbytir/tir-list) + "Categories" card with per-category counts.
- Chart stays as "Overview" section in the main column.

## Alternatives
- Tailwind: rejected, plain CSS keeps the zero-CSS-dep setup.
- Copying reference markup: rejected; same genre, original code, brand palette kept.
