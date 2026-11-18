import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../catalog/", import.meta.url);
let failed = false;
const fail = (msg) => {
  failed = true;
  console.error(msg);
};

for (const category of readdirSync(root).sort()) {
  const dir = join(root.pathname, category);
  let files;
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  } catch {
    fail(`${category}: cannot read directory`);
    continue;
  }
  const slugs = new Set();
  for (const file of files.sort()) {
    const where = `${category}/${file}`;
    let e;
    try {
      e = JSON.parse(readFileSync(join(dir, file), "utf8"));
    } catch {
      fail(`${where}: invalid JSON`);
      continue;
    }
    for (const field of ["slug", "name", "description", "url"]) {
      if (typeof e?.[field] !== "string" || !e[field].trim()) fail(`${where}: missing or empty "${field}"`);
    }
    if (!Array.isArray(e?.tags) || !e.tags.every((t) => typeof t === "string" && t.trim())) {
      fail(`${where}: "tags" must be a non-empty array of strings`);
    }
    if (typeof e?.url === "string" && !/^https?:\/\//.test(e.url)) fail(`${where}: "url" must start with http(s)`);
    if (e?.links !== undefined) {
      if (typeof e.links !== "object" || e.links === null || Array.isArray(e.links)) {
        fail(`${where}: "links" must be an object`);
      } else {
        for (const [k, v] of Object.entries(e.links)) {
          if (!["website", "docs", "github"].includes(k)) fail(`${where}: unknown links key "${k}"`);
          else if (typeof v !== "string" || !/^https?:\/\//.test(v)) fail(`${where}: links.${k} must start with http(s)`);
        }
      }
    }
    if (typeof e?.slug === "string") {
      if (e.slug !== file.replace(/\.json$/, "")) fail(`${where}: filename must match slug "${e.slug}"`);
      if (slugs.has(e.slug)) fail(`${where}: duplicate slug "${e.slug}"`);
      slugs.add(e.slug);
    }
  }
}

if (failed) process.exit(1);
console.log("data OK");
