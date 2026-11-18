# Spec Delta

## Purpose
Contributors MUST be able to add entries via fork + PR, with invalid entries rejected by CI.

## ADDED Requirements

### Requirement: Documented fork-PR path
`CONTRIBUTING.md` MUST describe forking, editing `src/data/*.json`, and opening a PR.

#### Scenario: New contributor
- **WHEN** a visitor wants to add an entry
- **THEN** CONTRIBUTING tells them which file to edit, the entry schema, and how to open the PR

### Requirement: Entry validation
CI MUST reject entries missing `slug`, `name`, `description`, `url`, or `tags`, with duplicate slugs, or with non-http(s) URLs.

#### Scenario: Invalid entry PR
- **WHEN** a PR adds an entry with a missing field or bad URL
- **THEN** the validation check fails with a message naming the file and problem
