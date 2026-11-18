# Design

## Context

See proposal.md for motivation. `src/lib/catalog.ts` loads JSON from six category folders. `Listing.tsx` renders generic facts; `[category]/[slug].astro` adds installation links, model specs, charts, FAQ, releases, and discussion. The current rating is local React state, not persisted. Installation links currently infer MCP configuration from a marketing URL or slug; the new contract prohibits those guesses.

`scripts/validate-data.mjs` validates only part of the current schema. It permits a narrow `links` key set and does not validate the proposed nested metadata. `model-pages` already specifies model facts and hiding empty sections; `catalog-enrichment` specifies source-derived enrichment and FAQ. These remain active independent changes, not durable main specs.

The `server-islands` plan moves the listing body to server rendering. Interactive copy controls, menus, and future media controls must retain an explicit client-side boundary; attaching handlers to an unhydrated server-rendered React component is insufficient. This change neither applies nor rewrites that rendering plan.

## Goals / Non-Goals

**Goals:** Define a backward-compatible metadata contract, reusable presentation, safe sourced setup, and deterministic missing-data behavior.

**Non-Goals:** New review storage, monetization services, new collectors, comprehensive enrichment of the catalog, automatic security scanning, home redesign, or adapter changes. No product code is written by this planning change.

## Decisions

### 1. Approaches

The user selected a shared page shell with category-specific sections. Six independent templates were considered but rejected because they duplicate identity, cost, privacy, and evidence presentation. A generic property dump was rejected because it obscures category-specific setup and permissions.

Preserve existing font/color tokens and route IDs, including `servers` for MCP servers and the existing sixth category `tools`. Show the human-readable “MCP Servers” on detail pages without renaming routes.

### 2. Page composition

Desktop has a main reading column and a setup/quick-facts sidebar. The sidebar is placed alongside the overview visually but follows category facts in the semantic reading order. On mobile it becomes an inline getting-started panel. No sticky panel may obscure focus or content.

```text
Breadcrumbs
Logo | Name | Category | Publisher
Summary | Website / documented access action | Sponsored (only if applicable)
Section navigation (only sections that exist)
Overview: best for, limitations, capabilities
Category facts
Getting started: prerequisites, effort, steps, copyable example
Pricing and external costs
Data handling, permissions, support
Evidence, sources, verification, applicable activity/releases/benchmarks
Alternatives | separate sponsored placement only if configured
Discussion
```

Use semantic definition lists for short fact grids, chips for compatibility/use cases, checklists for requirements, ordered lists for setup, code blocks for examples, tables for structured pricing/benchmarks, image figures for screenshots, and expandable source/technical details. Important limitations and permission warnings are not hidden in expandable content.

### 3. Shared metadata dictionary

Add optional `details`, `categoryDetails`, and `evidence` objects to `Entry`; do not require new fields on legacy JSON. Existing fields remain authoritative fallbacks. All new nested properties are optional unless the parent item requires identity fields below.

| Field under `details`                                   | Data shape                                                                      | Presentation                                                                               |
| ------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `bestFor`, `notSuitedFor`                               | string arrays                                                                   | Use-case chips; limitations list                                                           |
| `compatibility`                                         | array of `{kind, name, versions?}`                                              | Supported host/platform/runtime chips                                                      |
| `requirements`                                          | array of `{kind, description}`                                                  | Account, hardware, dependency, API-key checklist                                           |
| `setup`                                                 | `{difficulty?, estimatedMinutes?, steps?, instructions?, example?}`             | Setup summary and ordered steps                                                            |
| `setup.difficulty`                                      | `beginner`, `intermediate`, or `advanced`                                       | Labeled difficulty, no inferred score                                                      |
| `setup.steps`                                           | string array                                                                    | Ordered steps                                                                              |
| `setup.instructions`                                    | array of `{label, target, kind, value, sourceUrl}`                              | Copy command/config or source-backed link; `kind` is `command`, `configuration`, or `link` |
| `setup.example`                                         | `{input, output?, environment?}`                                                | Labeled input/output code or text                                                          |
| `cost`                                                  | `{model?, plans?, trial?, externalCosts?}`                                      | Cost summary, plan table, dependency-cost notes                                            |
| `cost.model`                                            | `free`, `freemium`, `subscription`, `usage-based`, `paid-once`, `contact-sales` | Human-readable cost-model label                                                            |
| `cost.plans`                                            | array of `{name, amount?, currency?, unit?, notes?, sourceUrl?}`                | Price amount with currency and billing/usage unit                                          |
| `cost.trial`                                            | string                                                                          | Trial terms, not inferred availability                                                     |
| `cost.externalCosts`                                    | string array                                                                    | Separate hosting, API, or hardware costs                                                   |
| `dataHandling`                                          | `{processing?, retention?, permissions?, destinations?, privacyUrl?}`           | Privacy summary and permission list                                                        |
| `dataHandling.processing`                               | `local`, `cloud`, or `hybrid`                                                   | Explicit processing location                                                               |
| `dataHandling.retention`                                | string                                                                          | Retention statement or unknown                                                             |
| `dataHandling.permissions`, `dataHandling.destinations` | string arrays                                                                   | Required permissions and data recipients                                                   |
| `maintainer`                                            | `{name?, url?, status?}`                                                        | Publisher identity and maintenance status                                                  |
| `maintainer.status`                                     | `active`, `maintenance-only`, `archived`, `discontinued`                        | Sourced status, never inferred from age alone                                              |
| `support`                                               | `{docsUrl?, channels?, tier?, responseCommitment?}`                             | Documentation, named `{label, url}` channels, sourced support terms                        |
| `media`                                                 | array of `{kind, url, alt?, caption?}`                                          | `screenshot` requires alt text; `demo` is a link or click-to-load media                    |
| `alternatives`                                          | array of `{category, slug, reason}`                                             | Up to four validated internal links; fall back to same category/shared use case            |

Strings are non-empty when present. Minutes are positive numbers; monetary amounts are non-negative numbers with currency and unit required whenever amount is present. No currency or billing unit is invented. `cost.plans` supports repeated provider/price-unit rows; notes identify provider and cached-token distinctions.

Continue to use existing `name`, `description`, `about`, `features`, `highlights`, `tags`, `repo`, `links`, `stats`, `pricing`, `builtWith`, `verdict`, and model data. Avoid adding duplicate name, description, capabilities, or logo fields; the existing validator already recognizes optional `icon`, which needs matching TypeScript typing. Shared documentation/support links use `details.support`, avoiding a breaking expansion of legacy `links`.

### 4. Category dictionary

`categoryDetails` contains only the key matching the listing's folder. Mixed category objects are rejected on newly authored data. Existing unrelated legacy fields can remain in JSON but are not rendered as another category's UI.

| Key          | Optional properties and content                                                                                                                                                                                                                                                                                                        | UI                                                                                                                                                                                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `skills`     | `format` string; `allowedTools` string array                                                                                                                                                                                                                                                                                           | Format fact and allowed-tool list. Purpose uses description/capabilities; hosts use compatibility; dependencies/permissions/setup use shared fields.                                                                                                             |
| `agents`     | `tasks`, `environments`, `triggers`, `modelRequirements`, `integrations`, `deploymentOptions` string arrays; `autonomy`, `approvalControls`, `memory` strings                                                                                                                                                                          | Task chips, environment/deployment facts, prominent autonomy/approval summary, memory disclosure.                                                                                                                                                                |
| `containers` | `registry`, `repository`, `tag`, `digest`, `baseOs`, `license`, `versionPolicy`, `updateCadence` strings; `architectures`, `requiredPrivileges` string arrays; `rootless` boolean; `sizes` array of `{architecture, bytes, basis}`; `ports`, `volumes` string arrays; `environment` array of `{name, description, required?, secret?}` | Image facts; architecture-specific compressed-size rows (`basis: compressed`); runtime configuration table; rootless and elevated-privilege summary. Commands use documented Podman instructions in shared setup; evidence links live under `evidence.security`. |
| `servers`    | `transport`, `hosting` strings; `clients` compatibility items; `authentication` `{methods?, scopes?, notes?}`; `tools` array of `{name, description, effect?}`; `resources`, `prompts` arrays of `{name, description}`                                                                                                                 | Connection facts, client chips, authentication/permissions panel, separate capabilities lists. `effect` is `read`, `write`, `destructive`, or `unknown`. Configuration and actual endpoint are supplied in setup, never inferred.                                |
| `models`     | `provider`, `version`, `availability`, `licenseRestrictions` strings; `toolCalling`, `structuredOutput` booleans; `accessOptions` array of `{label, url}`; `hardwareRequirements`, `rateLimits` strings                                                                                                                                | Provider/access facts, capability yes/no/unknown values, license restrictions, download/API actions, hardware and rate-limit notes. Modalities/context/output/release/cutoff/moderation/reasoning/parameters/endpoints stay in existing `specs`.                 |
| `tools`      | `integrations`, `importFormats`, `exportFormats` string arrays; `offlineSupport`, `accountRequired` booleans; `offlineLimitations`, `accessibility` strings; `cancellationUrl` HTTP(S) URL                                                                                                                                             | Integration chips, portability facts, offline/account/accessibility summary, cancellation link near pricing. Platforms, use cases, and quick start use shared fields.                                                                                            |

Permission scopes, host versions, and model hardware assumptions belong in explicit text fields, not inferred numeric scores. License restrictions and accessibility statements require evidence. Category evidence uses stable paths such as `categoryDetails.containers.rootless`.

### 5. Provenance and verification

`evidence.facts` is an array of `{field, sourceUrl, observedAt, attribution, version?}`. `field` is a stable catalog property path, including indexed price rows where necessary. `attribution` is `publisher`, `third-party`, or `directory`. Observation dates are ISO 8601 and not in the future.

`evidence.verification` is `{checkedAt, fields, method}`; its non-empty fields array identifies exactly what was checked. A timestamp alone never marks a whole listing verified. The method describes the check, not an unbounded guarantee. Dates supplied by collectors are not verification.

`evidence.security` is an array of `{type, sourceUrl, checkedAt, target, result, counts?}` where type is `sbom`, `signature`, or `scan`. Counts map severity labels to non-negative integers. A target names the version or image digest; SBOM/signature records describe their actual result instead of implying a vulnerability scan.

`evidence.benchmarks` is an array of `{metric, value, scale, sourceUrl, measuredAt, target, methodologyUrl, configuration?}`. Uncontextualized legacy scores retain source attribution but are labeled incomplete/unverified; only complete records enter the verified benchmark presentation. Do not fabricate missing dates for legacy data.

Core facts remain readable without expanding sources. Each fact links to its evidence in a keyboard-accessible source list. `Not provided` means no value; `Not verified` means a value lacks adequate checking evidence. A known false value is rendered “Not supported” or “No,” not hidden.

No new global expiration threshold is invented. Show actual evidence dates; stale status requires a documented future freshness policy. “Last verified” is a source-check label, not a quality badge.

### 6. Commercial disclosure and ratings

This is a placement contract, not ad-system implementation. No sponsor schema, billing flow, SDK, tracker, or empty ad slot is introduced. Future paid entries must use separate labeled sponsored areas and must not modify organic alternatives, evidence, or factual content. `Sponsored` applies to paid listing placement; `Advertisement` applies to display ads.

Persistent reviews remain undecided and outside scope. Keep discussion. Remove or suppress the current unsaved rating control during future implementation; do not add a replacement rating system. This avoids presenting a control that implies a saved review.

### 7. Compatibility, validation, and rendering boundaries

New fields are additive. Validate nested shapes, enums, non-empty strings, finite non-negative counts/prices, dates, category matching, internal alternative targets, safe external URLs, evidence references, and media alt text. Reject unknown new nested keys to catch typos without tightening legacy unknown-field behavior.

Only HTTP(S) public content URLs are accepted. Verified setup deep links are allowlisted per supported client, with parsed target/config validation; no arbitrary custom protocols. Render text/code escaped, never as executable HTML. Secret-bearing examples use named placeholders; validation flags credential-bearing fields and known secret patterns for rejection/redaction, without claiming arbitrary secret detection is perfect.

Collectors must preserve `details`, `categoryDetails`, and `evidence` unless explicitly updating their owned fields. Check actual write behavior before enabling enrichment. Do not expand collectors to gather every new field.

Use existing Astro/MUI patterns. Plain JSON crosses server-island boundaries. Use a small existing-style browser handler or narrowly hydrated component for copy/menu/media controls; keep static facts server-renderable. Do not add a component framework or shared schema dependency for these fields.

## Risks / Trade-offs

- Sparse catalog records: compact critical-unknown facts preserve useful browsing without empty panels; metadata remains optional.
- Unsupported install guesses: remove inferred links rather than silently preserving unsafe convenience.
- Evidence availability: publish transparent unknown/unverified states; no invented data or automatic scanning.
- Competing active changes: preserve model sections, FAQ-from-known-facts, charts, and discussion; reconcile rendering boundaries before implementation.
- Excessive metadata burden: prioritize best-for, compatibility, requirements, cost, setup, limitations, and verification; optional technical fields do not block existing listings.
- Secret detection limits: placeholders and manual content review complement bounded automated checks.

## Migration Plan

After design approval and an explicit apply request, implement additive types/validation first, then presentation with representative fixture data. Keep legacy records valid and use sources for real catalog additions. Verify all six populated and sparse categories, zero/false/unknown values, copy failures, safe content, mobile layout, and preserved model/discussion features.

Use the existing GitHub deployment workflow only when implementation is authorized. Roll back renderer changes while retaining optional JSON fields; no destructive data migration or infrastructure changes are needed. This planning-only commit must not modify product code or catalog data.
