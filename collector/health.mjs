import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { ProxyAgent, fetch as undiciFetch } from "undici";

const args = new Set(process.argv.slice(1));
const DRY_RUN = args.has("--dry-run");
const DIRECT = args.has("--direct");
const CHECK = args.has("--check");
const TIMEOUT_MS = 15000;
const DELAY_MS = 500;

const UA = "tir-list-collector/0.1 (+https://github.com/labsbytir/tir-list)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function proxyUrlFor(session) {
  const raw = process.env.WEBSHARE_PROXY;
  if (!raw) {
    if (DIRECT) return null;
    console.error(
      "WEBSHARE_PROXY not set. Refusing to check (pass --direct to override)."
    );
    process.exit(1);
  }
  const u = new URL(raw);
  const user = u.username
    ? `${u.username}-session-${session}`
    : `session-${session}`;
  return new URL(
    `${u.protocol}//${user}:${u.password}@${u.host}${u.port ? ":" + u.port : ""}`
  ).toString();
}

async function checkUrl(url, session) {
  const proxy = proxyUrlFor(session);
  const dispatcher = proxy ? new ProxyAgent(proxy) : undefined;
  const headers = { "user-agent": UA };
  for (const method of ["HEAD", "GET"]) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
      const res = await undiciFetch(url, {
        method,
        headers,
        dispatcher,
        signal: ctrl.signal,
      });
      clearTimeout(t);
      if (res.status === 405 || res.status === 501) continue;
      await res.body?.cancel().catch(() => {});
      return { ok: res.ok, status: res.status };
    } catch (err) {
      if (method === "GET")
        return {
          ok: false,
          status: 0,
          error: String(err.cause?.code || err.message),
        };
    }
  }
  return { ok: false, status: 0 };
}

function targetsOf(entry, category) {
  const urls = [{ kind: "url", url: entry.url }];
  for (const [kind, url] of Object.entries(entry.links || {}))
    urls.push({ kind: `links.${kind}`, url });
  return urls.map((u) => ({ ...u, key: `${category}/${entry.slug}` }));
}

async function main() {
  const root = new URL("../catalog/", import.meta.url);
  const targets = [];
  for (const category of readdirSync(root).sort()) {
    for (const file of readdirSync(join(root.pathname, category))
      .filter((f) => f.endsWith(".json"))
      .sort()) {
      const e = JSON.parse(
        readFileSync(join(root.pathname, category, file), "utf8")
      );
      targets.push(...targetsOf(e, category));
    }
  }
  if (DRY_RUN) {
    console.log(
      `dry run: ${targets.length} URLs across ${new Set(targets.map((t) => t.key)).size} entries`
    );
    return;
  }
  const results = [];
  for (const t of targets) {
    const r = await checkUrl(
      t.url,
      `health-${t.key.replace(/[^a-z0-9]+/gi, "-")}`
    );
    results.push({ ...t, ...r, at: new Date().toISOString() });
    const mark = r.ok ? "ok" : "BROKEN";
    console.log(`${mark} ${r.status || ""} ${t.key} [${t.kind}] ${t.url}`);
    await sleep(DELAY_MS);
  }
  const broken = results.filter((r) => !r.ok);
  const report = {
    checkedAt: new Date().toISOString(),
    total: results.length,
    broken: broken.length,
    results,
  };
  mkdirSync(new URL("../collector/", import.meta.url), { recursive: true });
  writeFileSync(
    new URL("../collector/health.json", import.meta.url),
    JSON.stringify(report, null, 2) + "\n"
  );
  console.log(`done: ${results.length - broken.length}/${results.length} ok`);
  if (CHECK && broken.length) {
    for (const b of broken)
      console.error(
        `broken: ${b.key} [${b.kind}] ${b.url} (${b.status || b.error})`
      );
    process.exit(1);
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
