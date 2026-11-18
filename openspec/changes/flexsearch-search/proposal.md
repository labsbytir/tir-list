# Proposal

## Why
Substring matching (`includes`) misses prefix/partial and typo-tolerant queries; user asked for FlexSearch (https://github.com/nextapps-de/flexsearch).

## What Changes
- Add `flexsearch` dep, build a client-side Document index over entry name/description/tags
- Search input queries FlexSearch instead of `String.includes`; category tabs stay DOM-based
- Re-index when the deferred server island swaps in (MutationObserver)

## Capabilities

### New Capabilities
- `catalog-search`: full-text search over catalog entries with partial matching

### Modified Capabilities
(none)

## Impact
- New dep `flexsearch@^0.8`; inline script in `index.astro` becomes FlexSearch-backed
- No data or markup contract changes; `data-cat` filtering unchanged
