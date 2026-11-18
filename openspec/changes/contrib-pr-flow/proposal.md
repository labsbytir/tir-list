# Proposal

## Why
Anyone should be able to add catalog entries by forking and opening a PR; currently no documented path and no validation.

## What Changes
- `CONTRIBUTING.md`: fork → edit `src/data/*.json` → PR steps and entry schema
- PR template prompting for required entry fields
- `npm run validate:data` script + CI workflow checking entry schema on PRs

## Capabilities

### New Capabilities
- `contrib-flow`: fork-PR contribution path with automated data validation

### Modified Capabilities
(none)

## Impact
- New: `CONTRIBUTING.md`, PR template, `scripts/validate-data.mjs`, CI workflow
- No site behavior changes
