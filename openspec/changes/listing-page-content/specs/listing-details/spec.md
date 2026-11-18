# Spec Delta

## Purpose

Help end users evaluate a resource through consistent, understandable detail pages before visiting, installing, or comparing it.

## ADDED Requirements

### Requirement: Shared listing structure

Every listing SHALL present identity, an overview, category facts, getting started, cost, data handling, evidence, alternatives, and discussion in a consistent order. Optional empty sections SHALL be omitted except for explicit decision-critical unknown states.

#### Scenario: Complete listing

- **WHEN** a visitor opens a listing with complete metadata
- **THEN** the page shows breadcrumbs, name, category, publisher, logo or fallback, summary, primary action, section navigation, overview, category facts, setup, pricing, privacy, evidence/activity, alternatives, and discussion in that reading order
- **AND** publisher resources, documentation, repository, and support appear as labeled links

### Requirement: Use cases and limitations

Listings SHALL support best-for use cases, not-suited-for limitations, capabilities, and a longer description. Claims SHALL distinguish resource capabilities from directory editorial guidance.

#### Scenario: Evaluating fit

- **WHEN** use cases and limitations are supplied
- **THEN** the overview shows “Best for” chips, a “Not suited for” list, capabilities, and the longer description
- **AND** limitations remain visible without opening a pricing or installation panel

### Requirement: Compatibility and prerequisites

Listings SHALL support compatible apps, operating systems, runtimes, required accounts, hardware, dependencies, and API-key requirements. Supported versions SHALL be displayed when supplied.

#### Scenario: Assessing compatibility

- **WHEN** a resource requires an external account and a particular runtime version
- **THEN** compatibility chips and a requirements checklist identify those prerequisites before setup instructions
- **AND** missing compatibility or requirements are labeled “Not provided,” not treated as universal support or no requirements

### Requirement: Getting-started actions

Listings SHALL support setup difficulty, estimated setup minutes, ordered setup steps, documentation, verified commands or connection configurations, and example input/output. Copying SHALL never execute instructions or disclose secrets.

#### Scenario: Successful copy

- **WHEN** a visitor copies a provided command or configuration
- **THEN** the exact value is copied and accessible success feedback appears
- **AND** the page identifies target environment and prerequisites

#### Scenario: Copy fails or installation details are absent

- **WHEN** clipboard access fails or a listing has no supplied installation target
- **THEN** a failed copy reports failure and leaves selectable text available
- **AND** absent installation data produces a documentation or website action instead of an invented command or one-click link

### Requirement: Cost transparency

Listings SHALL support free, freemium, subscription, usage-based, paid-once, and contact-sales cost models; plans; prices; currency; billing period or usage unit; trials; and separate API, hardware, or hosting costs. Unknown prices SHALL never be shown as zero.

#### Scenario: Free resource with paid dependencies

- **WHEN** a free agent requires a paid model API or hosted runtime
- **THEN** pricing distinguishes the free resource from external charges and links to available pricing sources

#### Scenario: Missing or zero pricing

- **WHEN** price is absent or explicitly zero
- **THEN** absence displays “Not provided” while explicit zero remains a valid displayed price with its unit

### Requirement: Data handling and support

Listings SHALL support local, cloud, or hybrid processing; retention; permissions; data destinations; privacy-policy links; maintainer identity; maintenance status; documentation; support channels; and support tier or response commitments when explicitly sourced.

#### Scenario: Evaluating privacy and support

- **WHEN** a listing declares cloud processing and a retention policy
- **THEN** a data-handling summary shows both with policy links and a separate support area identifies maintainer and available channels
- **AND** absent retention or permissions are explicitly unknown rather than described as private or permission-free

### Requirement: Media and alternatives

Listings SHALL support screenshots with alternative text, captioned demo links, and related listings with a reason for relevance. Demos SHALL not autoplay or load third-party embeds before user interaction.

#### Scenario: Understanding alternatives

- **WHEN** related resources exist
- **THEN** the page shows up to four named alternative links with summaries and a reason such as a shared use case or category
- **AND** matching uses category plus slug identity so equal slugs in different categories do not exclude unrelated entries

### Requirement: Accessible responsive presentation

Listing pages SHALL preserve reading order on mobile, provide keyboard-operable controls, semantic headings, labeled links, accessible status messages, and readable long commands. Horizontal scrolling SHALL be limited to individual code or data containers.

#### Scenario: Narrow screen and keyboard navigation

- **WHEN** a visitor browses at 360 CSS pixels wide using a keyboard
- **THEN** the main page has no horizontal overflow, facts and setup stack, focus is visible, and every action and section link works

### Requirement: Backward-compatible sparse listings

Existing URLs and minimum catalog records SHALL remain valid. Optional absent sections SHALL not create empty cards, fabricated FAQs, fake facts, or broken actions.

#### Scenario: Legacy entry

- **WHEN** a listing contains only slug, name, description, URL, and tags
- **THEN** identity, summary, category, and website action render
- **AND** compatibility, requirements, cost, data handling, and verification explicitly indicate missing information in a compact facts area
- **AND** empty category subsections, media, and FAQs are omitted

### Requirement: Preserve existing useful sections without misleading ratings

Listings SHALL retain applicable model specifications, sourced benchmarks, releases, activity charts, and discussion. GitHub stars, directory views, usage, issue summaries, and community ratings SHALL remain distinct. A non-persistent rating SHALL not appear as a saved review or aggregate score.

#### Scenario: Existing enriched model

- **WHEN** a model already has specs, FAQ, vendor siblings, charts, and discussion
- **THEN** those sections remain available without duplicated fact rows
- **AND** issue-derived strengths and tradeoffs remain labeled as issue analysis, not user reviews
- **AND** no unsaved interactive star control implies a submitted rating
