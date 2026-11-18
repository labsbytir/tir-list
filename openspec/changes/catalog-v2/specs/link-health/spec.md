# Spec Delta

## Purpose
Dead links MUST be caught automatically.

## ADDED Requirements

### Requirement: Health checker
`npm run collect:health` MUST check every entry URL and link through the proxy, write `collector/health.json`, and exit non-zero with `--check` when any link fails; a weekly CI job MUST run the check.

#### Scenario: Broken link
- **WHEN** a URL fails in check mode
- **THEN** the run reports which entry and URL failed and exits 1
