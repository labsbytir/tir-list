import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { ProxyAgent, fetch as undiciFetch } from "undici";

const UA = "tir-list-collector/0.1 (+https://github.com/labsbytir/tir-list)";
const DELAY_MS = 1000;

const args = new Set(process.argv.slice(1));
const DRY_RUN = args.has("--dry-run");
const DIRECT = args.has("--direct");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function proxyUrlFor(session) {
  const raw = process.env.WEBSHARE_PROXY;
  if (!raw) {
    if (DIRECT) return null;
    console.error(
      "WEBSHARE_PROXY not set. Refusing to scrape (pass --direct to override)."
    );
    process.exit(1);
  }
  const normalized = /^[a-z]+:\/\//i.test(raw) ? raw : `http://${raw}`;
  let u;
  try {
    u = new URL(normalized);
  } catch {
    console.error(
      "WEBSHARE_PROXY is not a valid URL. Expected http://username:password@host:port"
    );
    process.exit(1);
  }
  const user = u.username
    ? `${u.username}-session-${session}`
    : `session-${session}`;
  return new URL(
    `${u.protocol}//${user}:${u.password}@${u.host}${u.port ? ":" + u.port : ""}`
  ).toString();
}

function ghHeaders() {
  const headers = { "user-agent": UA, accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN)
    headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return headers;
}

async function ghFetch(url, session, { raw = false } = {}) {
  const proxy = proxyUrlFor(session);
  const res = await undiciFetch(url, {
    headers: raw ? { "user-agent": UA } : ghHeaders(),
    dispatcher: proxy ? new ProxyAgent(proxy) : undefined,
  });
  if (res.status === 202) return { retry: true };
  if (res.status === 403 || res.status === 404) return { forbidden: true };
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return raw ? { text: await res.text() } : { json: await res.json() };
}

export function parseRepoUrl(url) {
  const m = String(url || "").match(
    /^https?:\/\/github\.com\/([^/\s]+)\/([^/\s#?]+?)(?:\.git)?(?:[\s/#?].*)?$/i
  );
  return m ? `${m[1]}/${m[2]}` : null;
}

const CHANGELOG_FILES = [
  "CHANGELOG.md",
  "HISTORY.md",
  "CHANGELOG.rst",
  "CHANGELOG.txt",
];

async function enrichRepo(repo, session) {
  const { json: r } = await ghFetch(
    `https://api.github.com/repos/${repo}`,
    session
  );
  if (!r) throw new Error(`${repo}: repo fetch failed`);
  const stats = {
    stars: r.stargazers_count,
    forks: r.forks_count,
    watchers: r.subscribers_count,
    openIssues: r.open_issues_count,
    license: r.license ? r.license.spdx_id || r.license.name : null,
    pushedAt: r.pushed_at,
    fetchedAt: new Date().toISOString(),
  };
  let releases = [];
  try {
    const rel = await ghFetch(
      `https://api.github.com/repos/${repo}/releases?per_page=10`,
      session
    );
    if (rel.json) {
      releases = rel.json.map((x) => ({
        tag: x.tag_name,
        name: x.name || x.tag_name,
        publishedAt: x.published_at,
        url: x.html_url,
        notes: (x.body || "").slice(0, 500),
      }));
    }
  } catch {
    releases = [];
  }
  let changelog = null;
  const branch = r.default_branch || "main";
  for (const file of CHANGELOG_FILES) {
    try {
      const raw = await ghFetch(
        `https://raw.githubusercontent.com/${repo}/${branch}/${file}`,
        session,
        { raw: true }
      );
      if (raw.text && raw.text.length > 50) {
        changelog = {
          source: file,
          url: `https://github.com/${repo}/blob/${branch}/${file}`,
          excerpt: raw.text.slice(0, 2000),
        };
        break;
      }
    } catch {
      continue;
    }
  }
  let activity = null;
  try {
    const act = await ghFetch(
      `https://api.github.com/repos/${repo}/stats/commit_activity`,
      session
    );
    if (act.json)
      activity = act.json.map((w) => ({
        week: w.week,
        days: w.days,
        total: w.total,
      }));
  } catch {
    activity = null;
  }
  let views = null;
  try {
    const tv = await ghFetch(
      `https://api.github.com/repos/${repo}/traffic/views?per=week`,
      session
    );
    if (tv.json) {
      views = {
        count: tv.json.count,
        uniques: tv.json.uniques,
        weeks: (tv.json.views || []).map((w) => ({
          date: w.timestamp.slice(0, 10),
          count: w.count,
          uniques: w.uniques,
        })),
      };
    }
  } catch {
    views = null;
  }
  return { stats, releases, changelog, activity, views };
}

function loadEntries() {
  const root = new URL("../catalog/", import.meta.url);
  const out = [];
  for (const category of readdirSync(root).sort()) {
    for (const file of readdirSync(join(root.pathname, category))
      .filter((f) => f.endsWith(".json"))
      .sort()) {
      const path = join(root.pathname, category, file);
      out.push({
        category,
        file: path,
        entry: JSON.parse(readFileSync(path, "utf8")),
      });
    }
  }
  return out;
}

async function enrichOpenRouterUsage(items) {
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn("OPENROUTER_API_KEY not set, skipping usage history.");
    return 0;
  }
  const key = process.env.OPENROUTER_API_KEY;
  const res = await undiciFetch(
    "https://openrouter.ai/api/v1/datasets/rankings-daily?period=week",
    {
      headers: {
        "user-agent": UA,
        authorization: `Bearer ${key}`,
      },
      dispatcher: proxyUrlFor("openrouter-usage")
        ? new ProxyAgent(proxyUrlFor("openrouter-usage"))
        : undefined,
    }
  );
  if (!res.ok) throw new Error(`rankings-daily: HTTP ${res.status}`);
  const { data } = await res.json();
  const byModel = new Map();
  for (const row of data || []) {
    if (row.model_permaslug === "other") continue;
    if (!byModel.has(row.model_permaslug)) byModel.set(row.model_permaslug, []);
    byModel
      .get(row.model_permaslug)
      .push({ date: row.date, tokens: Number(row.total_tokens) });
  }
  let updated = 0;
  for (const { entry, file } of items) {
    if (!entry.permaslug) continue;
    const rows = [...byModel.keys()]
      .filter(
        (k) => k === entry.permaslug || k.startsWith(entry.permaslug + ":")
      )
      .flatMap((k) => byModel.get(k));
    if (!rows.length) continue;
    const seen = new Map(rows.map((r) => [r.date, r.tokens]));
    entry.usageHistory = [...seen.entries()]
      .map(([date, tokens]) => ({ date, tokens }))
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .slice(-90);
    writeFileSync(file, JSON.stringify(entry, null, 2) + "\n");
    updated++;
  }
  return updated;
}

async function main() {
  const all = loadEntries();
  const items = all.filter(({ entry }) =>
    parseRepoUrl(entry.links?.github || entry.url)
  );
  const modelItems = all.filter(({ entry }) => entry.permaslug);
  if (DRY_RUN) {
    for (const { category, entry } of items) {
      console.log(
        `would enrich: ${category}/${entry.slug} (${parseRepoUrl(entry.links?.github || entry.url)})`
      );
    }
    console.log(
      `dry run: ${items.length} repo-backed + ${modelItems.length} OpenRouter entries`
    );
    return;
  }
  let updated = 0;
  for (const { entry, file } of items) {
    const repo = parseRepoUrl(entry.links?.github || entry.url);
    entry.repo = repo;
    try {
      const data = await enrichRepo(repo, `enrich-${entry.slug}`);
      entry.stats = data.stats;
      entry.releases = data.releases;
      if (data.changelog) entry.changelog = data.changelog;
      if (data.activity) entry.activity = data.activity;
      if (data.views) entry.views = data.views;
      const today = new Date().toISOString().slice(0, 10);
      const hist = Array.isArray(entry.statsHistory) ? entry.statsHistory : [];
      if (hist[hist.length - 1]?.date !== today)
        hist.push({ date: today, stars: data.stats.stars });
      entry.statsHistory = hist.slice(-120);
      writeFileSync(file, JSON.stringify(entry, null, 2) + "\n");
      updated++;
    } catch (err) {
      console.error(`enrich failed, continuing: ${repo} (${err.message})`);
    }
    await sleep(DELAY_MS);
  }
  console.log(`done: ${updated}/${items.length} enriched`);
  try {
    const usage = await enrichOpenRouterUsage(all);
    console.log(`usage history: ${usage} models updated`);
  } catch (err) {
    console.error(`usage enrichment failed, continuing (${err.message})`);
  }
  execFileSync("npm", ["run", "validate:data"], { stdio: "inherit" });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
