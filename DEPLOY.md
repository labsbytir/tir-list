# Deploy — Debian 13 minimal, no Docker

Target: `150.241.230.243`. Staff backend/auth: `https://www.bosbase.com/`.

## 1. Base

```bash
apt update && apt install -y curl git caddy
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt install -y nodejs
```

No Docker, no melange. (melange builds Wolfi APK packages — irrelevant on stock Debian; you run Node directly.)

## 2. App

```bash
git clone <repo> /srv/tir-list && cd /srv/tir-list
npm ci
cp .env.example .env   # fill BOSBASE_API_KEY
npm run sync:bosbase   # local PGlite upsert + push to Bosbase
npm run build
```

## 3. Run (systemd)

`/etc/systemd/system/tir-list.service`:

```ini
[Unit]
Description=tir-list
After=network.target

[Service]
WorkingDirectory=/srv/tir-list
Environment=NODE_ENV=production
Environment=PGLITE_DIR=/var/lib/tir-list/pglite
Environment=BOSBASE_URL=https://www.bosbase.com
EnvironmentFile=/srv/tir-list/.env
ExecStart=/usr/bin/node ./dist/server/entry.mjs
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
mkdir -p /var/lib/tir-list/pglite && chown -R www-data /var/lib/tir-list
systemctl enable --now tir-list
```

## 4. Proxy (Caddy)

`/etc/caddy/Caddyfile`:

```
tir-list.example.com {
    reverse_proxy 127.0.0.1:3000
}
```

```bash
systemctl reload caddy
```

## Env

See `.env.example`: `BOSBASE_URL`, `BOSBASE_API_KEY`, `PGLITE_DIR`, `PORT`, `WEBSHARE_PROXY`, `GITHUB_TOKEN`, `OPENROUTER_API_KEY`.

For GitHub Actions, store `WEBSHARE_PROXY` and `OPENROUTER_API_KEY` under repo Settings → Secrets → Actions (`GITHUB_TOKEN` is automatic). The weekly `collector` workflow uses them to refresh listings; no DuckDB involved — listings live as git-tracked JSON, PGlite mirrors them at runtime.

## Notes

- Comments (fuma-comment UI + Bosbase auth adapter) land once the Bosbase auth endpoint is confirmed; `roles`/`comments`/`rates` tables already exist in PGlite.
- Bosbase itself installs wherever its own docs say; nothing on the repo side needs Docker.

## Cloudflare cache checklist

Code side is done in `src/middleware.ts` (HTML + server-island Cache-Control). The rest are zone settings:

- Caching level: Standard; Browser TTL: Respect Existing Headers; Edge TTL: honor origin (`s-maxage`) — https://developers.cloudflare.com/cache/how-to/set-caching-levels/ , https://developers.cloudflare.com/cache/how-to/edge-browser-cache-ttl/
- Always Online: on (serves the prerendered shell when origin drops) — https://developers.cloudflare.com/cache/how-to/always-online/
- Cache keys: default; include query string on `/_server-islands/*` (props travel in the URL) — https://developers.cloudflare.com/cache/how-to/cache-keys/
- **Crawler Hints: ON (must)** — Caching → Crawler Hints, or API: `PATCH /zones/{zone}/cache/crawler_hints` — https://developers.cloudflare.com/cache/advanced-configuration/crawler-hints/
- Early Hints / Smart Hints: on — https://developers.cloudflare.com/cache/advanced-configuration/early-hints/
- Security: Cache Deception Armor on; never cache `/api/*` with auth (middleware only touches GET HTML/islands, no cookies inspected) — https://developers.cloudflare.com/cache/cache-security/avoid-web-poisoning/ , https://developers.cloudflare.com/cache/cache-security/cache-deception-armor/ , https://developers.cloudflare.com/cache/cache-security/cors/
- Purge on deploy: Purge Everything (or by prefix `/`, `/_server-islands/*`) after each deploy since island URLs embed a per-build encryption key — https://developers.cloudflare.com/cache/guides/invalidate-cache/
