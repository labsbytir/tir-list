# Design

## Approach
- `CONTRIBUTING.md`: fork, branch, edit the category JSON under `src/data/`, `npm run validate:data`, push, open PR.
- `scripts/validate-data.mjs`: node script (no deps) reading the 4 JSON files, checking required fields, types, unique slugs per file, http(s) URLs; exits non-zero with file:problem messages.
- `.github/workflows/validate-data.yml`: runs on PR + push to main (`npm run validate:data`).
- PR template with entry checklist.

## Alternatives
- Zod schema: rejected, zero-dep script is smaller for 5-field entries.
