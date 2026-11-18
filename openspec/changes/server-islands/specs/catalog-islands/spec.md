# Spec Delta

## Purpose
Catalog grid MUST load as a deferred server island so first paint shows the shell instantly with fallback, then the entries.

## ADDED Requirements

### Requirement: Deferred grid
The catalog page MUST render shell content immediately with fallback text, then replace it with the server-rendered grid.

#### Scenario: Island loads after shell
- **WHEN** a visitor loads `/`
- **THEN** fallback content is visible first and the full entry grid appears once the island resolves

### Requirement: Serializable island props
Props passed to the island MUST be serializable (plain objects, arrays, strings).

#### Scenario: No function props
- **WHEN** the page passes catalog data to the island
- **THEN** only JSON-serializable values cross the island boundary
