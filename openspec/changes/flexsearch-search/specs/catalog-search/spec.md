# Spec Delta

## Purpose
Catalog search MUST return relevant entries for partial and prefix queries, not just exact substrings.

## ADDED Requirements

### Requirement: Full-text search
The site MUST rank entries by relevance for a text query across name, description, and tags, supporting prefix/partial matches.

#### Scenario: Partial query matches
- **WHEN** a visitor types a prefix of an entry's name or tag (e.g. "flex")
- **THEN** matching entries remain visible and non-matching entries are hidden

#### Scenario: Empty query shows all
- **WHEN** the search box is empty
- **THEN** all entries in the selected category are visible
