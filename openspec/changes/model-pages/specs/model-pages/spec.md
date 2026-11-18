# Spec Delta

## Purpose
Model pages MUST answer the same questions the reference answers: what it is, what it costs, what it runs on, when it released, and what's related.

## ADDED Requirements

### Requirement: Full model sections
Model detail pages MUST render specs grid (modalities, context, released, knowledge cutoff, max output, moderation, parameters, endpoints, reasoning), an FAQ derived from specs, and more-from-vendor cards.

#### Scenario: Model page visit
- **WHEN** a visitor opens a model with specs
- **THEN** all spec rows, FAQ entries, and same-vendor links render; models without specs show no empty sections
