# Proposal

## Why
No cache policy exists; Cloudflare docs (caching levels, edge/browser TTL, Always Online, cache keys, crawler hints [must], early hints, cache security) should map to repo code + deploy checklist.

## What Changes
- `src/middleware.ts`: Cache-Control for HTML pages and `/_server-islands/*` GETs
- `DEPLOY.md`: cache section mapping each doc to dashboard/API setting, crawler hints marked must

## Capabilities

### New Capabilities
- `edge-cache`: cache headers + Cloudflare cache checklist

### Modified Capabilities
(none)

## Impact
- One new file; no behavior change beyond response headers on GET
