# Spec Delta

## Purpose
Visitors MUST see what's gaining stars fastest.

## ADDED Requirements

### Requirement: Trending page
`/trending` MUST rank entries with ≥2 statsHistory points by stars/day; otherwise it MUST show an empty state explaining two enrich runs are needed.

#### Scenario: Insufficient history
- **WHEN** no entry has 2+ history points
- **THEN** the page states trending unlocks after repeated `collect:enrich` runs
