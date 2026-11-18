import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { ProxyAgent, fetch as undiciFetch } from "undici";

const UA = "tir-list-collector/0.1 (+https://github.com/labsbytir/tir-list)";
const DELAY_MS = 1000;

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run");
const OVERWRITE = args.has("--overwrite");
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
  const u = new URL(raw);
  // Fresh session per link: Webshare rotates/analytics per username suffix.
  const user = u.username
    ? `${u.username}-session-${session}`
    : `session-${session}`;
  return new URL(
    `${u.protocol}//${user}:${u.password}@${u.host}${u.port ? ":" + u.port : ""}`
  ).toString();
}

async function fetchText(url, session) {
  const proxy = proxyUrlFor(session);
  const headers = {
    "user-agent": UA,
    accept: "application/vnd.github+json, text/markdown, */*",
  };
  if (process.env.GITHUB_TOKEN)
    headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await undiciFetch(url, {
    headers,
    dispatcher: proxy ? new ProxyAgent(proxy) : undefined,
  });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.text();
}

export function slugify(s) {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "entry"
  );
}

export function parseAwesome(markdown, limit) {
  const out = [];
  const seen = new Set();
  for (const line of markdown.split("\n")) {
    const m = line.match(
      /^\s*[*-]\s*\[([^\]]+)\]\((https?:\/\/[^)]+)\)\s*-?\s*(.*)$/
    );
    if (!m) continue;
    const slug = slugify(m[1]);
    if (seen.has(slug)) continue;
    seen.add(slug);
    out.push({
      slug,
      name: m[1].trim(),
      description: (m[3] || "").trim(),
      url: m[2].trim(),
    });
    if (out.length >= limit) break;
  }
  return out;
}

export function parseGithubTopic(json, limit) {
  return (json.items || []).slice(0, limit).map((r) => ({
    slug: slugify(r.name),
    name: r.name,
    description: (r.description || "").trim(),
    url: r.html_url,
  }));
}

async function collectSource(src) {
  if (src.type === "github-topic") {
    const url =
      `https://api.github.com/search/repositories?q=topic:${encodeURIComponent(src.topic)}` +
      `&sort=stars&order=desc&per_page=${src.limit}`;
    const data = JSON.parse(await fetchText(url, `topic-${src.topic}`));
    return parseGithubTopic(data, src.limit).map((e) => ({
      ...e,
      tags: [src.category],
    }));
  }
  if (src.type === "awesome-list") {
    const md = await fetchText(src.url, `awesome-${slugify(src.url)}`);
    return parseAwesome(md, src.limit).map((e) => ({
      ...e,
      tags: [src.category],
    }));
  }
  throw new Error(`unknown source type: ${src.type}`);
}

const { default: config } = await import("./sources.json", {
  with: { type: "json" },
});

async function main() {
  let planned = 0,
    written = 0,
    skipped = 0;
  for (const src of config.sources) {
    let entries;
    try {
      entries = DRY_RUN ? [] : await collectSource(src);
    } catch (err) {
      console.error(
        `source failed, continuing: ${src.type} ${src.topic || src.url} (${err.message})`
      );
      continue;
    }
    if (DRY_RUN) {
      console.log(
        `would fetch: ${src.type} ${src.topic || src.url} -> catalog/${src.category}/`
      );
      planned++;
      continue;
    }
    for (const e of entries) {
      if (!e.description) continue;
      const dir = new URL(`../catalog/${src.category}/`, import.meta.url);
      mkdirSync(dir, { recursive: true });
      const file = new URL(
        `../catalog/${src.category}/${e.slug}.json`,
        import.meta.url
      );
      if (existsSync(file) && !OVERWRITE) {
        skipped++;
        continue;
      }
      writeFileSync(file, JSON.stringify(e, null, 2) + "\n");
      written++;
    }
    await sleep(DELAY_MS);
  }

  console.log(
    DRY_RUN
      ? `dry run: ${planned} sources planned`
      : `done: ${written} written, ${skipped} skipped`
  );
  if (!DRY_RUN)
    execFileSync("npm", ["run", "validate:data"], { stdio: "inherit" });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
