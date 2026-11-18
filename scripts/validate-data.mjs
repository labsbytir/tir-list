import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  validateCategoryDetails,
  validateDetails,
  validateEvidence,
} from "../src/lib/listing-contract.ts";

const root = new URL("../catalog/", import.meta.url);
let failed = false;
const fail = (msg) => {
  failed = true;
  console.error(msg);
};

// Slug index for details.alternatives targets (filename must match slug).
const slugsByCategory = new Map();
for (const category of readdirSync(root).sort()) {
  const dir = join(root.pathname, category);
  let files;
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  } catch {
    continue;
  }
  slugsByCategory.set(
    category,
    new Set(files.sort().map((f) => f.replace(/\.json$/, "")))
  );
}

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
    if (
      e?.icon !== undefined &&
      (typeof e.icon !== "string" || !/^https?:\/\//.test(e.icon))
    )
      fail(`${where}: "icon" must be an http(s) URL`);
    if (e?.install !== undefined) {
      if (
        typeof e.install !== "object" ||
        e.install === null ||
        Array.isArray(e.install)
      ) {
        fail(`${where}: "install" must be an object`);
      } else {
        for (const k of ["label", "command"]) {
          if (typeof e.install[k] !== "string" || !e.install[k].trim())
            fail(`${where}: install.${k} must be a non-empty string`);
        }
      }
    }
    if (e?.links !== undefined) {
      if (
        typeof e.links !== "object" ||
        e.links === null ||
        Array.isArray(e.links)
      ) {
        fail(`${where}: "links" must be an object`);
      } else {
        for (const [k, v] of Object.entries(e.links)) {
          if (!["website", "docs", "github"].includes(k))
            fail(`${where}: unknown links key "${k}"`);
          else if (typeof v !== "string" || !/^https?:\/\//.test(v))
            fail(`${where}: links.${k} must start with http(s)`);
        }
      }
    }
    if (e?.repo !== undefined && !/^[^/\s]+\/[^/\s]+$/.test(e.repo))
      fail(`${where}: "repo" must look like "owner/name"`);
    if (
      e?.permaslug !== undefined &&
      (typeof e.permaslug !== "string" || !e.permaslug.trim())
    )
      fail(`${where}: "permaslug" must be a non-empty string`);
    for (const k of ["specs", "benchmarks"]) {
      if (e?.[k] !== undefined && e[k] !== null && typeof e[k] !== "object")
        fail(`${where}: "${k}" must be an object or null`);
    }
    if (e?.usageHistory !== undefined) {
      if (!Array.isArray(e.usageHistory))
        fail(`${where}: "usageHistory" must be an array`);
      else if (e.usageHistory.length > 90)
        fail(`${where}: "usageHistory" capped at 90 points`);
    }
    if (e?.stats !== undefined) {
      for (const k of ["stars", "forks", "watchers", "openIssues"]) {
        if (e.stats[k] !== undefined && typeof e.stats[k] !== "number")
          fail(`${where}: stats.${k} must be a number`);
      }
      for (const k of ["license", "pushedAt", "fetchedAt", "tokens"]) {
        if (e.stats[k] !== undefined && typeof e.stats[k] !== "string")
          fail(`${where}: stats.${k} must be a string`);
      }
    }
    if (e?.statsHistory !== undefined) {
      if (!Array.isArray(e.statsHistory))
        fail(`${where}: "statsHistory" must be an array`);
      else if (e.statsHistory.length > 120)
        fail(`${where}: "statsHistory" capped at 120 points`);
    }
    if (e?.releases !== undefined && !Array.isArray(e.releases))
      fail(`${where}: "releases" must be an array`);
    if (
      e?.changelog !== undefined &&
      e.changelog !== null &&
      typeof e.changelog !== "object"
    ) {
      fail(`${where}: "changelog" must be an object or null`);
    }
    if (e?.activity !== undefined && !Array.isArray(e.activity))
      fail(`${where}: "activity" must be an array`);
    if (typeof e?.slug === "string") {
      if (e.slug !== file.replace(/\.json$/, ""))
        fail(`${where}: filename must match slug "${e.slug}"`);
      if (slugs.has(e.slug)) fail(`${where}: duplicate slug "${e.slug}"`);
      slugs.add(e.slug);
    }
    if (e?.details !== undefined)
      for (const msg of validateDetails(where, e.details, slugsByCategory))
        fail(msg);
    if (e?.categoryDetails !== undefined)
      for (const msg of validateCategoryDetails(
        where,
        category,
        e.categoryDetails
      ))
        fail(msg);
    if (e?.evidence !== undefined)
      for (const msg of validateEvidence(where, e.evidence, e)) fail(msg);
  }
}

if (failed) process.exit(1);
console.log("data OK");
