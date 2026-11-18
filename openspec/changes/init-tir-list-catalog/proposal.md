# Proposal

## Why

Empty repo with only README; need a runnable Astro v7 static catalog for Skills, MCP Servers, AI Models, Linux Flavors.

## What Changes

- Scaffold Astro v7 + TypeScript strict, static output
- `src/pages/index.astro` with search + category filter + card grid
- `src/data/*.json` seed data for 4 categories
- OpenSpec + Gadget preflight baseline (already init)

## Capabilities

### New Capabilities

- `catalog`: browse/search static catalog of web tools across 4 categories

### Modified Capabilities

(none)

## Impact

- New files: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/**`
- Deps: `astro@^7.4.12`, `typescript`; build via Vite 8 / Rust compiler (strict HTML)
- Deploy target: static `dist/` → Cloudflare Pages
