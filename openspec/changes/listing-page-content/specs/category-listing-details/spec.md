# Spec Delta

## Purpose

Expose the technical and practical facts that differ between resource categories without forcing users through irrelevant generic fields.

## ADDED Requirements

### Requirement: Category-specific fact presentation

Each listing SHALL show only its category's applicable fact groups within the shared layout. Missing category fields SHALL not imply supported capabilities. Explicit false and zero values SHALL remain visible.

#### Scenario: Unrelated metadata

- **WHEN** a container entry carries legacy model metadata
- **THEN** the page does not render a model specifications section
- **AND** the same shared overview, cost, and evidence rules still apply

### Requirement: Skill details

Skill listings SHALL support purpose, skill format, compatible agent hosts and versions, dependencies, allowed tools, permissions, prerequisites, installation instructions, and example input/output.

#### Scenario: Skill with known installation

- **WHEN** a skill declares format, supported hosts, tools, and a documented install command
- **THEN** facts show format and host chips, requirements list dependencies, permissions list allowed tools, and setup shows the exact command and an invocation example
- **AND** declared compatibility is not generalized to “Any agent”

### Requirement: Agent details

Agent listings SHALL support tasks, execution environments, autonomy level, approval controls, memory behavior, triggers, model/provider requirements, integrations, deployment options, setup, and example input/output.

#### Scenario: Agent with write access

- **WHEN** an agent runs on a schedule, retains memory, and can write through an integration
- **THEN** facts explain trigger and deployment options, a control summary describes autonomy and approval rules, and data handling describes memory and integration access
- **AND** required models, accounts, and API charges appear before setup

### Requirement: Container image details

Container listings SHALL support registry, repository, tags, version/update policy, digest, architectures, base OS, compressed size, license, exposed ports, volumes, environment variables, rootless support, required privileges, pull/run examples, SBOM links, signature evidence, and scan evidence.

#### Scenario: Versioned container

- **WHEN** an image has a digest, two architectures, and size measurements
- **THEN** a fact grid identifies registry, tag, digest, base OS, license, update policy, and architectures
- **AND** sizes identify architecture, unit, and compressed measurement basis
- **AND** runtime configuration lists ports, volumes, and environment variable names with secret placeholders
- **AND** setup provides source-backed Podman examples and warns about required elevated privileges

#### Scenario: Rootless compatibility is unknown

- **WHEN** no rootless support evidence is available
- **THEN** rootless support reads “Not provided,” not “Supported”
- **AND** absent scan or signature evidence does not produce a security badge

### Requirement: MCP server details

MCP listings SHALL support tools, resources, prompts, tool read/write or destructive effects, compatible clients, transport, local/remote hosting, authentication, permission scopes, prerequisites, and verified connection configuration.

#### Scenario: Remote authenticated server

- **WHEN** a server declares a remote endpoint, transport, OAuth scopes, and client support
- **THEN** facts identify hosting and transport, capability lists distinguish tools/resources/prompts, and authentication explains required permissions
- **AND** setup shows client-specific configuration based on the actual endpoint with secret placeholders
- **AND** read/write or destructive tool effects are labeled when known

#### Scenario: Website is not a verified endpoint

- **WHEN** only a marketing URL or catalog slug is known
- **THEN** the page offers documentation or the website
- **AND** it does not convert that URL into an MCP endpoint or the slug into an executable package name

### Requirement: Model details

Model listings SHALL support provider, version, hosted/open-weight availability, license restrictions, modalities, context/output limits, release/cutoff dates, moderation, reasoning, tool calling, structured output, parameters, endpoints, access options, hardware needs, rate limits, prices, benchmarks, and example requests/responses.

#### Scenario: Hosted model

- **WHEN** model API pricing, limits, capabilities, and endpoint details are available
- **THEN** a spec grid displays capabilities and limits, an access panel links supported endpoints, and examples use a placeholder API key
- **AND** pricing distinguishes input, output, cached-token prices when supplied, currency, unit, and provider
- **AND** existing FAQ, release/cutoff, vendor links, and usage charts remain available when data exists

#### Scenario: Open-weight model

- **WHEN** downloadable weights and hardware requirements are supplied
- **THEN** the access panel links the weights and license and identifies local runtime, memory/VRAM, and quantization assumptions
- **AND** open weights are not automatically labeled open source or unrestricted commercial use

### Requirement: Tool details

Tool listings SHALL support use cases, platforms, integrations, pricing, getting-started steps, import/export formats, offline support, accessibility information, account requirements, and cancellation terms.

#### Scenario: Subscription tool

- **WHEN** a tool provides subscription pricing, an export format, offline limits, and cancellation documentation
- **THEN** facts identify platforms and integrations, portability shows import/export formats, access shows account and offline requirements, and pricing links cancellation terms
- **AND** accessibility statements link to their evidence rather than asserting general compliance

### Requirement: Safe examples and documented access

Category examples SHALL identify their target client, version or environment where supplied, inputs, outputs, and required permissions. External instructions SHALL be treated as content, not executed automatically.

#### Scenario: Example needs credentials

- **WHEN** an example requires a token, password, environment file, or paid account
- **THEN** the example uses explicit placeholders and prerequisite guidance
- **AND** rendered content contains no live secrets, executable remote embeds, or automatic installation
