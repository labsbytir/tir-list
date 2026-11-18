# Spec Delta

## Purpose
Comments MUST stay short and link-free on first sight; violations MUST be held, never dropped.

## ADDED Requirements

### Requirement: Length and link holds
Posts over 500 chars or matching a link pattern MUST be stored flagged; clean posts MUST publish.

#### Scenario: Link post
- **WHEN** an anonymous post contains a URL or domain pattern
- **THEN** it is held and absent from listings
