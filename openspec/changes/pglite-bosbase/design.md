# Design

## Approach
- `src/lib/db.ts` (erasable TS only, importable from Astro and plain node): `getDb()` singleton, `CREATE EXTENSION vector`, `listings` table + fuma-comment-shaped `roles`/`comments`/`rates`, `upsertListing()`.
- `src/lib/bosbase.ts`: `pushListings(entries)` POSTs to `${base}/api/listings` with Bearer key (documented assumption; adjust path once Bosbase API is confirmed).
- `scripts/sync-bosbase.mjs`: glob `catalog/*/*.json`, upsert local, push remote.
- PGlite data under `./data/pglite` (gitignored). `@electric-sql/pglite-socket` installed for future wire-protocol access; not wired until a PG client needs it.
- fuma-comment UI + Bosbase auth adapter land once the Bosbase auth endpoint is known; no dead UI shipped.

## Alternatives
- Postgres container: rejected per operator constraint.
- Drizzle/Prisma now: rejected, raw SQL keeps zero extra deps until the comment backend lands.
