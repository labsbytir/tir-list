# Design

## Approach
- `parseModelCatalog`: extend `specs` with releasedAt (from created), knowledgeCutoff, maxOutput + moderated (top_provider), parameters, endpoints, reasoning summary.
- Detail page: specs definition list; `<details>` FAQ built from present fields; vendor = permaslug prefix, siblings from catalog.
- `ModelSpecs` typed interface in catalog.ts; validator unchanged.

## Alternatives
- Provider table per model: rejected, needs the per-model endpoints API call (rate budget); top-provider summary suffices.
