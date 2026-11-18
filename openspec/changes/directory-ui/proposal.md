# Proposal

## Why
Homepage is a bare list; user wants it to read like a tool directory page (reference: mcp.directory skill page) with sticky header, nav, sidebar action card, and polished cards.

## What Changes
- Restyle `index.astro` as directory home: sticky header (logo, category nav, Submit, mobile menu), hero, search + pill tabs, card grid, sidebar (Add-your-tool card with copyable commands, Categories card), footer
- Restyle `CatalogGrid.astro` cards: mono title, tag line, line-clamped description, meta footer
- New client JS: copy-to-clipboard buttons, mobile menu toggle, header nav driving the category filter

## Capabilities

### New Capabilities
- `directory-home`: directory-style homepage with header, sidebar, and card grid

### Modified Capabilities
(none)

## Impact
- `src/pages/index.astro`, `src/components/CatalogGrid.astro` markup/CSS only
- Search (FlexSearch), server island, chart, brand palette, validation unchanged
