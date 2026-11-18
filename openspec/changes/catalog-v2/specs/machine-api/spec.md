# Spec Delta

## Purpose
Agents and users MUST be able to consume the whole catalog as JSON.

## ADDED Requirements

### Requirement: Catalog JSON endpoint
`GET /api/catalog.json` MUST return all entries grouped by category with a generated timestamp.

#### Scenario: Agent fetch
- **WHEN** a client GETs `/api/catalog.json`
- **THEN** it receives `{ updated, categories: { <id>: [...] } }` with HTTP 200 and JSON content type
