# Spec Delta

## Purpose
Entries MAY carry website/docs/GitHub links, and the built site MUST serve an `llms.txt` index plus per-category files.

## ADDED Requirements

### Requirement: Optional links
`links` MUST be optional; when present each of `website`/`docs`/`github` MUST be an http(s) URL; unknown keys MUST fail validation.

#### Scenario: Entry with links
- **WHEN** an entry has `links.github`
- **THEN** validation passes and the card shows a GitHub link

### Requirement: Generated llms.txt
`npm run build` MUST regenerate `public/llms.txt` and `public/llms/<category>.txt` listing every entry with name, description, URL, and links.

#### Scenario: Fresh entry
- **WHEN** a new catalog file is added and the site builds
- **THEN** it appears in `llms.txt` and its category file
