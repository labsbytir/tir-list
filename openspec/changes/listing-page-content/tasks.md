# Tasks

Implementation is not authorized by creation of this plan. All tasks remain unchecked until an explicit apply request.

## 1. Metadata contract and safe validation

- [ ] 1.1 Add optional shared, category-specific, evidence, and existing icon types in `src/lib/catalog.ts`; document field shapes and precedence in `CONTRIBUTING.md`; verify one complete fixture per category and existing minimum entries conform without new required metadata.
- [ ] 1.2 Extend catalog validation for nested types, enums, finite numeric values, dates, category matching, internal targets, evidence paths, media alt text, safe URLs, allowlisted install deep links, and credential placeholders; add TypeScript tests covering accepted complete/sparse records and rejected malformed or unsafe records; verify zero and false survive validation and future verification dates fail.
- [ ] 1.3 Inspect write paths in `collector/collect.mjs` and `collector/enrich.mjs`; preserve new manually supplied metadata wherever current writes would overwrite it; add a round-trip fixture test proving `details`, `categoryDetails`, and `evidence` survive refresh and document collector ownership.

## 2. Shared listing UI

- [ ] 2.1 Implement identity, navigation, overview, compatibility, requirements, cost/external charges, privacy/support, media, and critical-unknown presentation using existing UI patterns; add populated and minimum-record render tests verifying section order, zero/false/unknown distinctions, and no empty optional cards.
- [ ] 2.2 Implement documented setup steps, copy controls, examples, and documentation fallback; remove guessed MCP endpoints/packages and “Any agent” compatibility; test exact copied text, rejected clipboard access, no automatic execution, no secret output, and no invented install links.
- [ ] 2.3 Keep interactive controls working across the chosen server/client boundary and suppress the unsaved rating control without adding review persistence; verify keyboard interactions, visible focus, accessible copy status, preserved discussion, and no claim of a saved rating.
- [ ] 2.4 Render validated alternatives using category plus slug identity and relevance reasons; test same-slug resources across categories, missing targets, deterministic fallback order, a maximum of four results, and no commercial influence on organic order.

## 3. Category-specific presentation

- [ ] 3.1 Implement Skills and Agents fact groups, host compatibility, autonomy/approval controls, permissions, memory, triggers, and setup examples; verify complete and sparse fixtures for each category and document their metadata examples.
- [ ] 3.2 Implement container registry/version/digest, architecture/size, runtime configuration, rootless/privilege, license, and evidence UI; verify architecture-specific units, unknown versus false rootless support, documented Podman instructions, and no positive security badge without evidence; document one container fixture.
- [ ] 3.3 Implement MCP transport/hosting, capabilities, read/write/destructive labels, client compatibility, authentication/scopes, and supplied connection configurations; verify complete and sparse fixtures plus a marketing-URL-only fixture that never produces an install endpoint; document one MCP fixture.
- [ ] 3.4 Extend Models and Tools sections with access/license/capability/hardware/rate-limit and portability/offline/accessibility/account/cancellation fields; verify populated and sparse fixtures while preserving model specs, source-derived FAQ, vendor siblings, and usage history; document both category examples.

## 4. Evidence and disclosure

- [ ] 4.1 Render per-fact sources, scoped verification dates, security evidence, benchmark methods/version/date, and independently labeled popularity/issue analysis; add tests for partial verification, incomplete legacy benchmark context, mismatched image digests, and missing evidence; document source attribution and verification rules.
- [ ] 4.2 Document future Sponsored/Advertisement locations and organic-independence requirements without introducing a monetization service; verify ordinary listings emit no empty commercial panel, sponsor claim, ad request, or third-party demo request before interaction.

## 5. Integrated acceptance

- [ ] 5.1 Run `npm run validate:data` and `npm run build` plus the TypeScript regression tests introduced above; verify all pass and inspect generated output for all six listing categories with complete and minimum fixtures.
- [ ] 5.2 Check listing pages at 360-pixel and desktop widths, keyboard navigation, long code/table scrolling, copy failure, media activation, existing model charts/FAQ/discussion, and unhydrated/server-island boundaries; record reproducible results and confirm no home, branding, adapter, or deployment changes.
- [ ] 5.3 Run `openspec validate listing-page-content --strict`, check task status against actual implementation, pass repository pre-commit checks, and commit/push isolated changes referencing `listing-page-content`; verify remote commit identity before reporting delivery.

## Workflow follow-up

- Request design review before applying this change.
- Keep deployment on the existing GitHub workflow; do not deploy by hand.
- Archive only after implemented acceptance criteria and review requirements pass.
