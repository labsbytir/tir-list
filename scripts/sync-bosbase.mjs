import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getDb, upsertListing } from "../src/lib/db.ts";
import { pushListings } from "../src/lib/bosbase.ts";

mkdirSync(process.env.PGLITE_DIR || "./data/pglite", { recursive: true });

const root = new URL("../catalog/", import.meta.url);
const entries = [];

for (const category of readdirSync(root).sort()) {
  for (const file of readdirSync(join(root.pathname, category))
    .filter((f) => f.endsWith(".json"))
    .sort()) {
    const e = JSON.parse(
      readFileSync(join(root.pathname, category, file), "utf8")
    );
    entries.push({
      slug: e.slug,
      category,
      name: e.name,
      description: e.description,
      url: e.url,
      tags: e.tags,
      links: e.links || {},
    });
  }
}

for (const entry of entries) await upsertListing(entry);
console.log(`upserted ${entries.length} listings into PGlite`);

await pushListings(entries);
await (await getDb()).close();
