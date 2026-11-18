# Proposal

## Why
Scraped entries lack identity (no icons), carry no language/tech tags, duplicate across sources, and only model pages have FAQs.

## What Changes
- URL-keyed cross-source dedupe in collect (GitHub repo == homepage)
- Punkpeye emoji → language/scope/OS/official tags; GitHub topics → tags (top 5)
- `EntryIcon` (favicon service + initial fallback) on cards and detail heroes; optional manual `icon` field
- Machine-generated FAQ on every detail page (what/where/maintainer + model specs)

## Capabilities (new)
- `listing-depth`
