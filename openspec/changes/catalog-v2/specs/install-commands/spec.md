# Spec Delta

## Purpose
Entries MAY carry a copy-paste install command.

## ADDED Requirements

### Requirement: Install commands
Optional `install {label, command}` MUST validate as non-empty strings and render as a copyable block on detail pages when present.

#### Scenario: Install from page
- **WHEN** a visitor opens an entry with an install command
- **THEN** a copy button copies the exact command
