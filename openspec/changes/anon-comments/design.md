# Design

## Approach
- Cookie `tir_anon=anon-<uuid>` set by the Astro API wrapper when absent; `getSession` parses it from request headers → `{id}`. Hono route itself stays unchanged.
- Avatar: mulberry32 from id hash, mirrored 5×3 brick grid on evergreen, lime rare; long immutable cache.
- Auto-mod score in `postComment` (links>3, banned regex, caps>0.7 on 50+ chars, >2000 chars, 24h duplicate) → `flagged=true`; listing filters flagged.
- Report: `POST /api/comments/report` (Astro endpoint, no Hono), `reports+1`, flag at ≥3. UI picker fetches the page thread and posts the selected id.

## Alternatives
- Client localStorage id: rejected, server cookie works across the API boundary without client changes.
- fuma built-in report: doesn't exist (verified in package).
