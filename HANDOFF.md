# Handoff

Read this before touching the site. The last agent merged the branch and left the real work undone.

## Where the code is

- Repo: `https://github.com/labsbytir/tir-list`
- `main` is `7462800` (`docs: rewrite the server-islands plan for the Node adapter`). Pushed.
- Local branch `fix/responsive-directory-polish` points at the same commit. Nothing left to merge.
- Live site: `https://tirlist.xyz/`. Host `150.241.230.243`, SSH `ssh -i ~/.ssh/prod_penny root@150.241.230.243`. App dir `/srv/tir-list`, user `github-deploy`, systemd `tir-list.service`.
- Deploy is `.github/workflows/deploy.yml` on push to `main`. Do not deploy by hand. After a deploy, confirm `cf-cache-status: MISS` before claiming the site changed. Cloudflare serves a stale copy otherwise.
- `pkill -f` on the server matches its own SSH command and kills the session. Use a self-excluding pattern.

## What the last agent was told to do, and did not

The user asked for a redesign onto Astro server islands (`https://docs.astro.build/en/guides/server-islands/`) with the React integration (`https://docs.astro.build/en/guides/integrations-guide/react/`), and for the OpenSpec. The agent wrote the OpenSpec and stopped. No page uses `server:defer`.

The plan is `openspec/changes/server-islands/`. It validates (`openspec validate server-islands --strict`). Apply it with the `openspec-apply-change` skill. Do not rewrite it again.

What the plan says, in short:

- Home: one `<CatalogGrid server:defer>` for the six columns, with fallback content. `src/pages/index.astro` currently renders `CatalogGrid` inline inside the column loop.
- Listing: move `Listing` in `src/pages/[category]/[slug].astro` from `client:load` to `server:defer`. Leave `StarsHistory`, `ViewsHistory`, `UsageHistory` on `client:load` and `Discussion` on `client:visible`.
- Props across the island boundary are plain JSON.
- Keep `@astrojs/node` standalone. Do not add the Cloudflare adapter. The old proposal wanted that adapter; it was wrong and has been rewritten.
- The home search script reads cards on first paint. After the island, the cards are not in the first HTML. Re-query them when the island swaps in.
- An earlier `server:defer` island returned 400 because Caddy overwrote `Cache-Control`. The island route must set no cache header. Caddyfile stays a plain `reverse_proxy 127.0.0.1:3000`. Caddy 2.6.2 rejects the `header` shorthand inside `reverse_proxy`.

## Broken or unfinished, in the order that matters

1. **Server islands are not built.** See above. This is the open change.

2. **`@thesvg/react` is installed and unused.** The user said `npm install @thesvg/react`. It is in `package.json` at `^4.0.12` and imported nowhere. Either wire it or remove it. Do not leave a dead dependency.

3. **Stack icons never render.** `src/components/StackMark.tsx` only matches 14 hard-coded names, and it only renders inside the "Built with" chips in `src/components/Listing.tsx`. Those chips read `entry.builtWith`. The 8 seed entries have no `builtWith`, because `npm run collect:enrich` has never succeeded. `WEBSHARE_PROXY` is unset and the collector refuses to run without it. Ask for it through the secret tool, never the chat. Until enrichment runs, the developer-icons work is invisible.

4. **Card logos guess the brand from the hostname.** `src/components/EntryIcon.astro` takes `host.split(".")[0]` and requests `https://cdn.jsdelivr.net/gh/rdimascio/icons@master/icons/<brand>.svg`. `www.`, `docs.`, and `api.` hosts ask for icons named `www`, `docs`, and `api`, miss, and fall back to a letter. Strip those prefixes before the lookup.

5. **Three icon systems for one job.** Devicons (`@dev.icons/react`) was added, then removed. developer-icons SVGs are in `StackMark.tsx`. rdimascio SVGs are in `EntryIcon.astro`. `@thesvg/react` is installed and unused. Pick one for brand logos and one for technology marks. Delete the others.

6. **Social login is created and not enabled.** Production environment `environment_01M7Q7A7WTR7PCF7K7V18FCQ60`. Google, GitHub, Apple, and Microsoft OAuth records exist with `state: "Invalid"` because each needs a client id and secret from that platform. The callback URLs are in the conversation, not here; re-read them with the WorkOS `connectionsByType` query before pasting one anywhere. Credentials go through the secret tool.

7. **Enrichment data is empty.** Strengths, tradeoffs, pricing, and built-with exist in code and are blank on every seed. Same blocker as item 3: `WEBSHARE_PROXY`. `OPENROUTER_API_KEY` is also unset, so usage history is skipped.

8. **WorkOS sign-in branding has no logo.** The dark theme and the heading are set on staging and production. Uploading `public/brand/tirlist-white.svg` is not available through the API. It has to be done in the dashboard.

## Do not touch

- Fonts and colors. Body `system-ui`, titles `ui-monospace`. Greens `#020202` `#0d2818` `#04471c` `#058c42` `#16db65` `#d7efe0`.
- The home layout. It matches a G2 screenshot on purpose: centered hero, one search, two chips, sliding name row, p5 drift, then the six columns.
- The Node adapter. The Cloudflare adapter cannot run this site under plain Node.
- `/srv/tir-list/.env`. WorkOS production client id is `client_01M7Q7A7ZS873JWH068310KVY4`. The API key and `WORKOS_COOKIE_PASSWORD` are already there, mode 600. The production redirect `https://tirlist.xyz/auth/callback` is set (`redir_01M7Q81YA7HGC3AY9BHS5Q9CV1`).
- `DEPLOY_SSH_KEY`. Do not regenerate it.

## Verify

`package.json` has no test script. `npm run check` prompts to install `@astrojs/check` and is not a gate. `npm run build` is the check, and it passed on `7462800`.
