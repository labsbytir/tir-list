# Spec Delta

## Purpose
Visitors MUST compare two entries side by side.

## ADDED Requirements

### Requirement: Compare page
`/compare?a=<key>&b=<key>` MUST render a field-by-field table (description, stars, license, links, tags, releases, updated); unknown keys MUST show a picker state, not an error.

#### Scenario: Share a comparison
- **WHEN** a visitor opens a compare URL with two valid keys
- **THEN** both entries render side by side with all fields
