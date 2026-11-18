# Proposal

## Why

End users need to judge whether a listed resource solves their problem, works with their setup, and is trustworthy before they try it. Current detail pages share generic fields and some model-specific sections, but lack a consistent contract for category-specific facts, setup, cost, and evidence.

## What Changes

- Specify one shared detail-page layout with category-specific sections for Skills, Agents, Containers, MCP Servers, Models, and Tools.
- Define use cases, limitations, compatibility, setup requirements, cost, data handling, maintainer/support, verification dates, demos, and alternatives.
- Define category-specific technical fields and the UI that presents them.
- Require explicit unknown states, source attribution, dated security/benchmark evidence, and safe installation instructions.
- Keep sponsorship separate from organic recommendations and reserve clearly labeled future placement rules without activating advertising.
- Preserve existing listing URLs, optional legacy catalog data, branding, model facts, charts, and discussion.
- Do not implement pages, collect new data, add review persistence, run security scans, activate ad networks, or alter the home layout in this planning change.

## Capabilities

### New Capabilities

- `listing-details`: Shared listing information, layout, actions, accessibility, and compatibility.
- `category-listing-details`: Category-specific facts, setup panels, and usage examples.
- `listing-evidence`: Provenance, verification, security and benchmark evidence, and commercial disclosure.

### Modified Capabilities

None. `openspec list --specs --json` returns no main specs. Related active changes remain independent: `model-pages`, `catalog-enrichment`, and `server-islands`.

## Impact

Future implementation touches `src/lib/catalog.ts`, `src/components/Listing.tsx`, `src/pages/[category]/[slug].astro`, catalog validation, representative catalog fixtures, and listing-related tests. Existing collectors must preserve manually supplied metadata. No new dependency, hosting change, database migration, or deployment is required for writing these artifacts.

## Planning checklist

- [x] Inspect current listing UI, data types, validator, and related proposals.
- [x] Write shared, category-specific, and evidence delta specs.
- [x] Write design and implementation tasks.
- [x] Validate artifacts and review the planning-only diff.
