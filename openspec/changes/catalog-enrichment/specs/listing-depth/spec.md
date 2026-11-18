# Spec Delta

## Purpose
Entries MUST be deduplicated, tagged by language/tech, badged with icons, and self-documented with FAQs.

## ADDED Requirements

### Requirement: Dedupe, tags, icons, FAQ
Collect MUST skip URLs already in the catalog; entries MUST carry language/tech tags where the source provides them; cards and pages MUST show icons; every detail page MUST render an auto-generated FAQ.

#### Scenario: Re-run collect
- **WHEN** collect runs twice
- **THEN** the second run writes nothing new for identical URLs
