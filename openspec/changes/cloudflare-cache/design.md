# Design

## Approach
- `src/middleware.ts` (`onRequest`): only GET; `/_server-islands/*` → `public, max-age=60, s-maxage=3600, stale-while-revalidate=86400`; `text/html` responses → `public, max-age=300, s-maxage=3600, stale-while-revalidate=86400`. Everything else passes through (future authenticated/API routes never cached by accident).
- Dashboard/API items (caching level, TTL rules, Always Online, cache keys, crawler hints, early hints, deception armor, CORS) go in DEPLOY.md — they are zone settings, not code.

## Alternatives
- `_headers` file: rejected, adapter owns `dist/_headers` and merge behavior is uncertain; middleware is explicit.
