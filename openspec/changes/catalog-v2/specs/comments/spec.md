# Spec Delta

## Purpose
Detail pages MUST host discussions backed by PGlite storage, with Bosbase auth as the final seam.

## ADDED Requirements

### Requirement: Comments
Each detail page MUST render a comments island reading/writing PGlite-backed storage; sign-in MUST route to Bosbase, implemented as an adapter stub until the Bosbase auth endpoint is confirmed.

#### Scenario: Unauthenticated visitor
- **WHEN** a signed-out visitor opens comments
- **THEN** threads are readable and sign-in points at Bosbase
