# Spec Delta

## Purpose
Model and tool entries MUST be collectable from OpenRouter with benchmarks, pricing, specs, and usage history intact.

## ADDED Requirements

### Requirement: OpenRouter collection
`openrouter-models` MUST map API models to entries with specs/benchmarks/permaslug; `openrouter-apps` MUST map ranking cards with token counts; enrich MUST attach `usageHistory` from rankings-daily when keyed.

#### Scenario: Keyless models run
- **WHEN** `collect` runs an `openrouter-models` source without a key
- **THEN** model entries land in `catalog/models/` with specs and embedded benchmarks

### Requirement: Attribution + display
Model pages MUST show specs, benchmark tables, and usage graphs with OpenRouter/AA attribution footers.

#### Scenario: Enriched model page
- **WHEN** a visitor opens a model with benchmarks and usage
- **THEN** pricing, benchmark tables, and a tokens-over-time chart render with citations
