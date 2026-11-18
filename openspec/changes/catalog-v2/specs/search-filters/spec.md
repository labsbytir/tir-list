# Spec Delta

## Purpose
Search MUST narrow by tag and stars and order by name, stars, or recency.

## ADDED Requirements

### Requirement: Filters and sort
The catalog search MUST offer a tag dropdown (all tags), a min-stars input, and sort by relevance/name/stars/updated combined with text query and category.

#### Scenario: Filtered search
- **WHEN** a visitor picks a tag and sorts by stars
- **THEN** only matching entries show, ordered by stars desc
