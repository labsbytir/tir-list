# Spec Delta

## Purpose

Let visitors distinguish supported facts, publisher claims, directory observations, popularity signals, and paid promotion when evaluating a listing.

## ADDED Requirements

### Requirement: Field-level provenance

Pricing, compatibility, permissions, data handling, maintenance status, security evidence, and benchmarks SHALL support field-level source URLs, observation dates, applicable versions, and attribution as publisher claim, third-party measurement, or directory observation.

#### Scenario: Source inspection

- **WHEN** a visitor inspects a sourced fact
- **THEN** its source link, observation date, attribution type, and version where relevant are available beside the fact or in an accessible expandable source list
- **AND** incompatible version or provider measurements remain separately labeled

### Requirement: Verification scope and freshness

“Last verified” SHALL refer to an explicit dated check and identify the fields checked. Import, publication, repository-push, and collection timestamps SHALL not imply that all listing facts were verified. Invalid or future verification dates SHALL be rejected.

#### Scenario: Partial verification

- **WHEN** a curator checked installation instructions but not pricing
- **THEN** the listing identifies the setup check and date without implying pricing was checked
- **AND** fields without evidence display “Not verified” or “Not provided” as appropriate

### Requirement: Unknown and negative values

Unknown, explicitly unsupported, unavailable, false, and zero SHALL have distinct presentation. Unsupported facts without evidence SHALL not be inferred from absent metadata.

#### Scenario: Unsupported versus unknown

- **WHEN** one tool explicitly does not work offline and another supplies no offline information
- **THEN** the first reads “Not supported” with its source while the second reads “Not provided”

### Requirement: Security evidence is scoped evidence

Security information SHALL identify evidence type, source, check date, target version or digest, and result. A scan or signature SHALL not imply blanket safety, absence of vulnerabilities, or directory endorsement.

#### Scenario: Container scan

- **WHEN** scan evidence exists for a particular image digest
- **THEN** the evidence panel names scanner/source, scan date, digest, reported severity counts where supplied, and a report link
- **AND** the result is not presented as a current scan of other tags or as a “secure” badge

#### Scenario: No evidence

- **WHEN** SBOM, signature, or scan data is absent
- **THEN** the page shows no positive security badge and offers no invented result

### Requirement: Benchmarks require context

Benchmarks SHALL include source, measurement date, metric name, value, unit or scoring scale, model/resource version, and methodology reference. Comparisons SHALL not imply equivalence across different methods or test configurations.

#### Scenario: Differing benchmark methods

- **WHEN** two scores use different datasets or configurations
- **THEN** the page labels their methods and versions separately rather than displaying an unsupported combined ranking
- **AND** missing required context prevents the score from appearing as a verified benchmark

### Requirement: Popularity is not quality or review evidence

Stars, views, token usage, and issue-derived observations SHALL identify their measurement source and timeframe where available. These metrics SHALL not be labeled community ratings, security ratings, or verified recommendations.

#### Scenario: GitHub issue summary

- **WHEN** strengths and tradeoffs summarize repository issues
- **THEN** the panel identifies the sample size and source and says it is issue analysis, not a user review
- **AND** GitHub stars and directory views appear under their own labels

### Requirement: Commercial placement disclosure

If future sponsorship or advertising is enabled, paid listing placements SHALL show “Sponsored” and display ads SHALL show “Advertisement” beside the placement. Payment SHALL not change factual metadata, security evidence, user ratings, or the organic alternatives order.

#### Scenario: Sponsored recommendation

- **WHEN** a paid placement appears near alternative listings
- **THEN** it occupies a separately labeled sponsored area, with sponsor identity available
- **AND** organic alternatives retain their independent matching/order logic

#### Scenario: Advertising not configured

- **WHEN** no commercial placement is configured
- **THEN** the page has no empty ad box, fake sponsor, third-party ad request, or reserved blank space

### Requirement: Safe external content

Listing text, media URLs, sources, and instructions SHALL be validated as untrusted content. Public links SHALL use safe HTTP(S) URLs, except explicitly supported and verified installation deep links. Source content SHALL not render executable HTML or expose credentials.

#### Scenario: Unsafe submitted content

- **WHEN** metadata contains a script URL, executable markup, or an actual secret
- **THEN** validation rejects the unsafe value or sanitizes it before publication
- **AND** no script executes and no secret appears in page output
