import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const catalogRoot = new URL("../catalog/", import.meta.url);
const outRoot = new URL("../public/", import.meta.url);

const categories = readdirSync(catalogRoot).sort();
const lines = [
  "# tir-list",
  "",
  "> A catalog of modern web tools. Find Skills, Models, Containers, Servers, Agents and Tools.",
  "",
];
const perCategory = new Map();

for (const category of categories) {
  const entries = [];
  for (const file of readdirSync(join(catalogRoot.pathname, category))
    .filter((f) => f.endsWith(".json"))
    .sort()) {
    entries.push(JSON.parse(readFileSync(join(catalogRoot.pathname, category, file), "utf8")));
  }
  entries.sort((a, b) => a.name.localeCompare(b.name));
  perCategory.set(category, entries);
  lines.push(`## ${category}`, "");
  for (const e of entries) {
    const extra = [
      e.links?.website && e.links.website !== e.url ? `[website](${e.links.website})` : null,
      e.links?.docs ? `[docs](${e.links.docs})` : null,
      e.links?.github ? `[github](${e.links.github})` : null,
    ]
      .filter(Boolean)
      .join(" | ");
    lines.push(`- [${e.name}](${e.url}): ${e.description}${extra ? ` (${extra})` : ""}`);
  }
  lines.push("");
}

mkdirSync(new URL("./llms/", outRoot), { recursive: true });
writeFileSync(new URL("./llms.txt", outRoot), lines.join("\n"));

for (const [category, entries] of perCategory) {
  const cat = [`# tir-list / ${category}`, ""];
  for (const e of entries) {
    cat.push(`- [${e.name}](${e.url}): ${e.description}`);
    if (e.links?.website) cat.push(`  website: ${e.links.website}`);
    if (e.links?.docs) cat.push(`  docs: ${e.links.docs}`);
    if (e.links?.github) cat.push(`  github: ${e.links.github}`);
  }
  cat.push("");
  writeFileSync(new URL(`./llms/${category}.txt`, outRoot), cat.join("\n"));
}

console.log(`llms.txt + ${perCategory.size} category files written`);
