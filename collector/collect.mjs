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
  // Fresh session per link: Webshare rotates/analytics per username suffix.
  const user = u.username
    ? `${u.username}-session-${session}`
    : `session-${session}`;
  return new URL(
    `${u.protocol}//${user}:${u.password}@${u.host}${u.port ? ":" + u.port : ""}`
  ).toString();
}

async function fetchText(url, session, extraHeaders = {}) {
  const proxy = proxyUrlFor(session);
  const headers = {
    "user-agent": UA,
    accept: "application/vnd.github+json, text/markdown, */*",
    ...extraHeaders,
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
  return (json.items || []).slice(0, limit).map((r) => {
    const links = { github: r.html_url };
    if (r.homepage) links.website = r.homepage;
    return {
      slug: slugify(r.full_name || r.name),
      name: r.name,
      description: (r.description || "").trim(),
      url: r.homepage || r.html_url,
      links,
      topics: Array.isArray(r.topics) ? r.topics.slice(0, 8) : [],
    };
  });
}

export function cleanDescription(s, limit = 300) {
  return String(s || "")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`#]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

export function parseModelCatalog(json, limit, exclude = [":batch"]) {
  return (json.data || [])
    .filter((m) => !exclude.some((x) => m.id.includes(x)))
    .slice(0, limit)
    .map((m) => ({
      slug: slugify(m.id),
      name: m.name,
      description: cleanDescription(m.description),
      url: `https://openrouter.ai/${m.id}`,
      tags: [
        "models",
        ...new Set(
          String(m.architecture?.modality || "")
            .split(/[^a-z]+/i)
            .filter(Boolean)
            .slice(0, 3)
        ),
      ],
      links: { website: `https://openrouter.ai/${m.id}` },
      permaslug: m.id,
      specs: {
        contextLength: m.context_length,
        pricingPrompt: m.pricing?.prompt,
        pricingCompletion: m.pricing?.completion,
        modalities: m.architecture?.modality,
        releasedAt: m.created
          ? new Date(m.created * 1000).toISOString().slice(0, 10)
          : null,
        knowledgeCutoff: m.knowledge_cutoff || null,
        maxOutput: m.top_provider?.max_completion_tokens ?? null,
        moderated: m.top_provider?.is_moderated ?? null,
        parameters: Array.isArray(m.supported_parameters)
          ? m.supported_parameters
          : [],
        endpoints: Array.isArray(m.endpoints) ? m.endpoints : [],
        reasoning: m.reasoning
          ? {
              mandatory: !!m.reasoning.mandatory,
              defaultEffort: m.reasoning.default_effort || null,
              efforts: Array.isArray(m.reasoning.supported_efforts)
                ? m.reasoning.supported_efforts
                : [],
            }
          : null,
      },
      benchmarks: m.benchmarks || null,
    }));
}

export function parseAppRankings(html, limit) {
  const out = [];
  const seen = new Set();
  const listMatch = html.match(/"itemListElement":\[(.*?)\]\s*}<\/script>/s);
  if (!listMatch) return out;
  const itemRe =
    /\{"@type":"ListItem","position":\d+,"name":"((?:[^"\\]|\\.)+)","item":"((?:[^"\\]|\\.)+)"\}/g;
  let m;
  while ((m = itemRe.exec(listMatch[1])) && out.length < limit) {
    const name = m[1].replace(/\\u0026/g, "&");
    const itemUrl = m[2];
    let url = itemUrl.startsWith("http")
      ? itemUrl
      : `https://openrouter.ai${itemUrl}`;
    const enc = itemUrl.match(/(?:^|\/)apps\/url\/(.+)$/);
    if (enc) {
      try {
        url = decodeURIComponent(enc[1]);
      } catch {
        url = `https://openrouter.ai${itemUrl}`;
      }
    }
    const slug = slugify(name);
    if (seen.has(slug)) continue;
    seen.add(slug);
    const esc = itemUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const card = html.match(new RegExp(`href="${esc}"([\\s\\S]{0,3000}?)</a>`));
    const body = card ? card[1] : "";
    const desc =
      (body.match(/line-clamp-2[^>]*>([^<]{10,400})</) || [])[1] || "";
    const tokens =
      (body.match(/([\d.]+[KMBT])<!-- --> <!-- -->tokens/) || [])[1] || null;
    const entry = {
      slug,
      name,
      description: desc.replace(/&#x27;/g, "'").trim(),
      url,
      tags: ["tools"],
      links: {
        website: url.startsWith("https://openrouter.ai/apps") ? url : undefined,
      },
      stats: tokens ? { tokens } : undefined,
    };
    if (!entry.links.website) delete entry.links;
    if (!entry.stats) delete entry.stats;
    out.push(entry);
  }
  return out;
}

export function parsePunkpeyeAwesome(markdown, limit) {
  const LANG = {
    "🐍": "python",
    "📇": "typescript",
    "🏎️": "go",
    "🦀": "rust",
    "#️⃣": "csharp",
    "☕": "java",
    "🌊": "cpp",
    "💎": "ruby",
  };
  const SCOPE = { "☁️": "cloud", "🏠": "local", "📟": "embedded" };
  const OS = { "🍎": "macos", "🪟": "windows", "🐧": "linux" };
  const out = [];
  const seen = new Set();
  let section = "";
  for (const line of markdown.split("\n")) {
    const h = line.match(/^###\s+(.+)$/);
    if (h) {
      section = slugify(h[1].replace(/<[^>]+>/g, ""));
      continue;
    }
    const m = line.match(/^\s*-\s*\[([^\]]+)\]\((https?:\/\/[^)]+)\)(.*)$/);
    if (!m) continue;
    const slug = slugify(m[1]);
    if (seen.has(slug)) continue;
    seen.add(slug);
    let rest = m[3] || "";
    rest = rest.replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, "");
    const extraTags = new Set();
    for (const [emoji, tag] of Object.entries({ ...LANG, ...SCOPE, ...OS })) {
      if (rest.includes(emoji)) extraTags.add(tag);
    }
    if (rest.includes("🎖")) extraTags.add("official");
    rest = rest.replace(
      /^[\s\p{Emoji}\p{So}\u2600-\u27BF\uFE0F🎖🐍📇🏎🦀#☕🌊💎☁🏠📟🍎🪟🐧]*/u,
      ""
    );
    rest = rest.replace(/^[–—-]\s*/, "").trim();
    out.push({
      slug,
      name: m[1].trim(),
      description: rest,
      url: m[2].trim(),
      section,
      extraTags: [...extraTags],
    });
    if (out.length >= limit) break;
  }
  return out;
}

async function fetchAwesome(url, session) {
  try {
    return await fetchText(url, session);
  } catch (err) {
    // Branch-agnostic: try main <-> master swap on failure.
    const swapped = url.includes("/main/")
      ? url.replace("/main/", "/master/")
      : url.replace("/master/", "/main/");
    if (swapped === url) throw err;
    return await fetchText(swapped, session);
  }
}

async function collectSource(src) {
  const orHeaders = process.env.OPENROUTER_API_KEY
    ? { authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` }
    : {};
  if (src.type === "model-catalog") {
    const data = JSON.parse(
      await fetchText(
        "https://openrouter.ai/api/v1/models",
        "model-catalog",
        orHeaders
      )
    );
    return parseModelCatalog(data, src.limit, src.exclude).map((e) => ({
      ...e,
      tags: [src.category, ...e.tags.slice(1)],
    }));
  }
  if (src.type === "app-rankings") {
    const html = await fetchText(
      "https://openrouter.ai/apps",
      "app-rankings",
      orHeaders
    );
    return parseAppRankings(html, src.limit).map((e) => ({
      ...e,
      tags: [src.category, ...e.tags.slice(1)],
    }));
  }
  if (src.type === "github-topic") {
    const url =
      `https://api.github.com/search/repositories?q=topic:${encodeURIComponent(src.topic)}` +
      `&sort=stars&order=desc&per_page=${src.limit}`;
    const data = JSON.parse(await fetchText(url, `topic-${src.topic}`));
    return parseGithubTopic(data, src.limit).map((e) => {
      const { topics, ...rest } = e;
      return {
        ...rest,
        tags: [
          src.category,
          ...(topics || [])
            .map((t) => slugify(t))
            .filter(Boolean)
            .slice(0, 5),
        ],
      };
    });
  }
  if (src.type === "awesome-list") {
    const md = await fetchAwesome(src.url, `awesome-${slugify(src.url)}`);
    return parseAwesome(md, src.limit).map((e) => ({
      ...e,
      tags: [src.category],
    }));
  }
  if (src.type === "awesome-punkpeye") {
    const md = await fetchAwesome(src.url, `awesome-${slugify(src.url)}`);
    return parsePunkpeyeAwesome(md, src.limit).map((e) => {
      const { section, extraTags, ...rest } = e;
      return {
        ...rest,
        tags: [
          src.category,
          ...(section ? [section] : []),
          ...(extraTags || []),
        ],
      };
    });
  }
  throw new Error(`unknown source type: ${src.type}`);
}

const { default: config } = await import("./sources.json", {
  with: { type: "json" },
});

export function normUrl(u) {
  try {
    const x = new URL(String(u || "").trim());
    return (
      x.hostname.replace(/^www\./, "").toLowerCase() +
      x.pathname.replace(/\/+$/, "")
    ).toLowerCase();
  } catch {
    return "";
  }
}

function entryUrls(e) {
  const urls = [e.url, ...(e.links ? Object.values(e.links) : [])];
  // GitHub repo pages and homepages count as the same listing.
  return urls
    .map((u) => {
      const n = normUrl(u);
      const m = n.match(/^github\.com\/([^/]+\/[^/]+)/);
      return m ? m[1] : n;
    })
    .filter(Boolean);
}

async function main() {
  let planned = 0,
    written = 0,
    skipped = 0,
    dupes = 0;
  const known = new Set();
  try {
    const { readdirSync, readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const root = new URL("../catalog/", import.meta.url);
    for (const category of readdirSync(root)) {
      for (const file of readdirSync(join(root.pathname, category)).filter(
        (f) => f.endsWith(".json")
      )) {
        try {
          for (const u of entryUrls(
            JSON.parse(
              readFileSync(join(root.pathname, category, file), "utf8")
            )
          )) {
            known.add(u);
          }
        } catch {
          continue;
        }
      }
    }
  } catch {
    /* empty catalog */
  }
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
        `would fetch: ${src.type} ${src.topic || src.url || `limit=${src.limit}`} -> catalog/${src.category}/`
      );
      planned++;
      continue;
    }
    for (const e of entries) {
      if (!e.description) continue;
      const keys = entryUrls(e);
      if (keys.some((k) => known.has(k))) {
        dupes++;
        continue;
      }
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
      for (const k of entryUrls(e)) known.add(k);
      written++;
    }
    await sleep(DELAY_MS);
  }

  console.log(
    DRY_RUN
      ? `dry run: ${planned} sources planned`
      : `done: ${written} written, ${skipped} skipped, ${dupes} duplicate URLs skipped`
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
