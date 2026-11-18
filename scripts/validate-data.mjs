import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dir = new URL("../src/data/", import.meta.url);
let failed = false;
const fail = (msg) => {
  failed = true;
  console.error(msg);
};

for (const file of readdirSync(dir)
  .filter((f) => f.endsWith(".json"))
  .sort()) {
  let entries;
  try {
    entries = JSON.parse(readFileSync(join(dir.pathname, file), "utf8"));
  } catch {
    fail(`${file}: invalid JSON`);
    continue;
  }
  if (!Array.isArray(entries)) {
    fail(`${file}: top level must be an array`);
    continue;
  }
  const slugs = new Set();
  entries.forEach((e, i) => {
    const where = `${file}[${i}]`;
    for (const field of ["slug", "name", "description", "url"]) {
      if (typeof e?.[field] !== "string" || !e[field].trim())
        fail(`${where}: missing or empty "${field}"`);
    }
    if (
      !Array.isArray(e?.tags) ||
      !e.tags.every((t) => typeof t === "string" && t.trim())
    ) {
      fail(`${where}: "tags" must be a non-empty array of strings`);
    }
    if (typeof e?.url === "string" && !/^https?:\/\//.test(e.url))
      fail(`${where}: "url" must start with http(s)`);
    if (typeof e?.slug === "string") {
      if (slugs.has(e.slug)) fail(`${where}: duplicate slug "${e.slug}"`);
      slugs.add(e.slug);
    }
  });
}

if (failed) process.exit(1);
console.log("data OK");
