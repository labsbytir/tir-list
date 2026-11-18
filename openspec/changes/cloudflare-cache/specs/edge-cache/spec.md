# Spec Delta

## Purpose
Public GET responses MUST carry edge-friendly Cache-Control; deploy docs MUST cover the Cloudflare cache checklist including crawler hints.

## ADDED Requirements

### Requirement: Cache headers
HTML page GETs MUST be edge-cacheable with revalidation; server-island GETs (unique encrypted URLs) MUST carry longer edge TTLs. Non-GET and API responses MUST be untouched.

#### Scenario: Island revalidation
- **WHEN** the browser refetches `/_server-islands/*`
- **THEN** the edge serves cache with stale-while-revalidate instead of re-rendering every time
