# Proposal

## Why
Login is dropped: comments go anonymous with generated-art avatars, plus machine auto-moderation and user reporting.

## What Changes
- Anon sessions: API route sets stable `tir_anon` cookie; `getSession` reads it (no sign-in)
- `GET /api/avatar/[seed].svg`: deterministic pixel-brick avatar (brand greens + lime) from the id hash
- Auto-mod in `postComment`: link spam, banned patterns, caps, length, duplicates → silently flagged (hidden)
- `POST /api/comments/report {id}`: increments reports, auto-flags at ≥3; report picker UI under the thread

## Capabilities (new)
- `anon-comments`

## Impact
- DB: `flagged`, `reports`, author columns via ALTER; getComments hides flagged
