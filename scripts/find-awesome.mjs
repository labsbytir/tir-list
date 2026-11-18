import { ProxyAgent, fetch as undiciFetch } from "undici";

const QUERIES = {
  skills: ["awesome claude skills", "awesome agent skills"],
  servers: ["awesome mcp servers", "awesome remote mcp"],
  models: ["awesome llm", "awesome small language models"],
  tools: ["awesome cli apps", "awesome command line"],
  containers: ["awesome docker", "awesome linux containers"],
  agents: ["awesome ai agents", "awesome autonomous agents"],
};

function proxy() {
  const raw = process.env.WEBSHARE_PROXY;
  if (!raw) {
    console.error("WEBSHARE_PROXY not set, refusing (private session only).");
    process.exit(1);
  }
  return new ProxyAgent(raw);
}

const dispatcher = proxy();
const headers = {
  "user-agent": "tir-list-collector/0.1",
  accept: "application/vnd.github+json",
};
if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

for (const [category, queries] of Object.entries(QUERIES)) {
  console.log(`\n== ${category} ==`);
  const seen = new Set();
  for (const q of queries) {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q + " in:name")}&sort=stars&order=desc&per_page=5`;
    try {
      const res = await undiciFetch(url, { headers, dispatcher });
      if (!res.ok) {
        console.log(`  query failed: ${q} (HTTP ${res.status})`);
        continue;
      }
      const { items = [] } = await res.json();
      for (const r of items) {
        if (seen.has(r.full_name)) continue;
        seen.add(r.full_name);
        console.log(`  ${r.stargazers_count}★ ${r.full_name} — ${(r.description || "").slice(0, 100)}`);
        console.log(`    raw: https://raw.githubusercontent.com/${r.full_name}/${r.default_branch}/README.md`);
      }
    } catch (err) {
      console.log(`  query error: ${q} (${err.message})`);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
}
