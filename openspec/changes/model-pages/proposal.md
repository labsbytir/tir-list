# Proposal

## Why
Model detail pages show only what the generic entry has; the reference model page (verified in-browser) carries modalities, context, release date, knowledge cutoff, max output, moderation, parameters, endpoints, reasoning config, FAQ, and same-vendor models — nearly all present in the models API.

## What Changes
- Collector maps the extra API fields into `specs` (releasedAt, knowledgeCutoff, maxOutput, moderated, parameters, endpoints, reasoning)
- Detail pages: full specs grid, FAQ accordion generated from specs, more-from-vendor cards
- Validator/CONTRIBUTING untouched (specs is already a free-form object)

## Capabilities (new)
- `model-pages`
