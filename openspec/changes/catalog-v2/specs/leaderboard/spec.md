# Spec Delta

## Purpose
Visitors MUST see top entries by stars, overall and per category.

## ADDED Requirements

### Requirement: Leaderboard page
`/leaderboard` MUST rank entries with stats by stars; entries without stats MUST list separately as unranked.

#### Scenario: Browse leaders
- **WHEN** a visitor loads `/leaderboard`
- **THEN** ranked tables show name, stars, category; unranked entries appear in their own section
