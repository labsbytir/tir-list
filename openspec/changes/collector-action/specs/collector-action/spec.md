# Spec Delta

## Purpose
Listings MUST refresh automatically on a schedule without human runs.

## ADDED Requirements

### Requirement: Scheduled collection
A weekly workflow MUST run collect, enrich, validation, llms regen, and a build check, committing `catalog/` + `public/llms*` back to main when changed.

#### Scenario: Weekly run
- **WHEN** the schedule fires with secrets present
- **THEN** main advances with fresh entries or the run succeeds with nothing to commit
