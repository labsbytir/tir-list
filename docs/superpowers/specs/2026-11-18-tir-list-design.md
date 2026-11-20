# tir-list — design (2026-11-18)

## Intent / why

Empty repo with README: "catalog of the modern webs tools. Find Skills, MCP Servers, AI Models and Linux Flavors".
User wants a static catalog site like https://www.opensourcealternatives.to/ — browse/search cards per tool.

## Goals

- Static catalog site, TypeScript, browsable locally + deployable to Cloudflare.
- 4 categories from README: Skills, MCP Servers, AI Models, Linux Flavors.
- Data-driven: one JSON/TS file per category, rendered as searchable cards.
- Podman-native local dev (no Compose, no Docker builds on Mac), Wolfi worker pattern if containerized.

## Non-goals

- No auth, no backend, no DB, no comments/ratings.
- No collecting/import pipeline yet.
- No framework migration (Next/Nuxt), no monorepo tooling.

## Anti-goals

- Failure = dynamic server required to view list, or data locked in HTML (not reusable JSON).

## Constraints (from project memory / AGENTS.md)

- TypeScript (allowed), Podman not Docker, no Compose.
- Cloudflare via `cf` CLI / wrangler for deploy; creds in OpenChamber env.
- Git repo, Conventional Commits, pre-commit (husky+lint-staged+prettier).
- OpenSpec change tracking required before code.
- Ponytail full: smallest diff that fully works.

## Approaches

1. **Astro v7 static site, content collections (Picked)** — Astro 7.4+, TypeScript strict, `src/content/` for 4 categories. Static output, Cloudflare Pages. Tradeoff: slightly more scaffold than vanilla Vite, but best for catalog + routing per item, matches user request for Astro v7.
2. **Vite + vanilla TS static site** — considered, dropped per user note to use Astro v7.
3. **Docs-only repo (markdown + JSON schema, no UI)** — fastest, but misses user's "site like ..." request.

Picked: #1 per user note (Astro v7, https://docs.astro.build/en/guides/upgrade-to/v7/).

## How (decided)

- Platform: static, Cloudflare Pages target.
- Language: TypeScript strict, Astro v7 (7.4.12 latest, Vite 8 inside, Rust compiler, Sätteri default — no remark/rehype plugins for v1).
- Data: `src/data/{skills,mcp-servers,ai-models,linux-flavors}.json` with `{ slug, name, description, url, tags }` (JSON first, migrate to content collections only when needed).
- UI v1: header + category tabs + search input + card grid, client filter (`<script>` island, no framework), no router. Valid HTML (Rust compiler is strict about unclosed tags), explicit `{" "}` spacing where needed.

## Left to builder (needs plan)

- Vite scaffold contents, `package.json` scripts, `.gitignore`, `tsconfig`.
- Seed data: 3–5 real entries per category or placeholder?
- Cloudflare deploy config (`wrangler.jsonc` vs `cf` Pages) + Podman dev container (Wolfi) — include in v1 or follow-up?
- OpenSpec change `init-tir-list-catalog` + pre-commit + gadget_init wiring.

## Approval

User approval of this doc covers approach + scope above. Next: `writing-plans` → OpenSpec change → scaffold.
