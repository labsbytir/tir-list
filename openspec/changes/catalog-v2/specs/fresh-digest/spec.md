# Spec Delta

## Purpose
Visitors MUST see the newest releases across the catalog.

## ADDED Requirements

### Requirement: Fresh digest page
`/fresh` MUST list releases sorted by date desc with entry name and tag; with no release data it MUST show an empty state pointing at `collect:enrich`.

#### Scenario: No releases yet
- **WHEN** no entry has releases
- **THEN** the page explains how releases get collected
