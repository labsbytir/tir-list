# Proposal

## Why
Comments need a size cap (500 chars) and link-bearing posts must be held for review, not published outright.

## What Changes
- `moderate()`: >500 chars → hold; any link (`http(s)://`, `www.`, bare domain with common TLD) → hold; UI hint under the thread

## Capabilities (new)
- `comment-limits`

## Impact
- Server-side enforcement in `src/lib/comments.ts` + one-line UI hint; existing holds unchanged
