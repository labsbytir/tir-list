# Spec Delta

## Purpose
The site MUST host a seeded, reproducible p5.js artwork with seed navigation and parameter controls.

## ADDED Requirements

### Requirement: Interactive artwork
`/art.html` MUST render deterministically from its seed, expose prev/next/random/jump seed controls, tunable parameters, regenerate/reset/download, and use the brand palette.

#### Scenario: Same seed twice
- **WHEN** a visitor opens `/art.html`, notes the seed, and returns to it later
- **THEN** the canvas renders identically
