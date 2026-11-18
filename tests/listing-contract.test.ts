import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  validateCategoryDetails,
  validateDetails,
  validateEvidence,
  type SlugIndex,
} from "../src/lib/listing-contract.ts";
import type { Entry } from "../src/lib/catalog.ts";

const here = dirname(fileURLToPath(import.meta.url));

function fixture(name: string): Entry {
  return JSON.parse(
    readFileSync(join(here, "fixtures", name), "utf8")
  ) as Entry;
}

function slugIndex(): SlugIndex {
  const root = join(here, "..", "catalog");
  const index: SlugIndex = new Map();
  for (const category of readdirSync(root).sort()) {
    try {
      const files = readdirSync(join(root, category)).filter((f: string) =>
        f.endsWith(".json")
      );
      index.set(
        category,
        new Set(files.sort().map((f: string) => f.replace(/\.json$/, "")))
      );
    } catch {
      continue;
    }
  }
  return index;
}

const slugs = slugIndex();
const categories = [
  "skills",
  "agents",
  "containers",
  "servers",
  "models",
  "tools",
] as const;

for (const category of categories) {
  test(`${category}: complete fixture validates clean`, () => {
    const e = fixture(`${category}.complete.json`);
    assert.equal(e.details !== undefined, true);
    assert.deepEqual(
      validateDetails(`${category}/fixture`, e.details, slugs),
      []
    );
    assert.deepEqual(
      validateCategoryDetails(
        `${category}/fixture`,
        category,
        e.categoryDetails
      ),
      []
    );
    assert.deepEqual(validateEvidence(`${category}/fixture`, e.evidence), []);
  });
}

test("sparse legacy entries remain valid without new metadata", () => {
  for (const [category, slug] of [
    ["skills", "superpowers"],
    ["models", "muse-spark"],
  ] as const) {
    const e = JSON.parse(
      readFileSync(
        join(here, "..", "catalog", category, `${slug}.json`),
        "utf8"
      )
    ) as Entry;
    assert.equal(e.details, undefined);
    assert.equal(e.categoryDetails, undefined);
    assert.equal(e.evidence, undefined);
  }
});

test("zero and false survive validation", () => {
  const tool = fixture("tools.complete.json");
  assert.deepEqual(validateDetails("tools/fixture", tool.details, slugs), []);
  const container = fixture("containers.complete.json");
  assert.deepEqual(
    validateCategoryDetails(
      "containers/fixture",
      "containers",
      container.categoryDetails
    ),
    []
  );
  const model = fixture("models.complete.json");
  assert.deepEqual(
    validateCategoryDetails("models/fixture", "models", model.categoryDetails),
    []
  );
});

test("unknown nested keys are rejected", () => {
  const errs = validateDetails("t", { bestFor: ["x"], bogus: 1 }, slugs);
  assert.match(errs.join("\n"), /unknown key "details\.bogus"/);
});

test("mixed category objects are rejected", () => {
  const errs = validateCategoryDetails("t", "servers", {
    servers: { transport: "x" },
    skills: { format: "y" },
  });
  assert.match(errs.join("\n"), /categoryDetails\.skills.*does not belong/);
});

test("future verification dates are rejected", () => {
  const errs = validateEvidence("t", {
    verification: {
      checkedAt: "2999-01-01",
      fields: ["details.setup"],
      method: "manual",
    },
  });
  assert.match(errs.join("\n"), /must not be in the future/);
});

test("live secrets rejected, placeholders accepted", () => {
  const bad = validateDetails(
    "t",
    {
      setup: {
        instructions: [
          {
            label: "x",
            target: "y",
            kind: "command",
            value: "export K=ghp_abcdef1234567890",
            sourceUrl: "https://example.com/d",
          },
        ],
      },
    },
    slugs
  );
  assert.match(bad.join("\n"), /live secret/);
  const good = validateDetails(
    "t",
    {
      setup: {
        instructions: [
          {
            label: "x",
            target: "y",
            kind: "configuration",
            value: '{"token": "<YOUR_TOKEN>"}',
            sourceUrl: "https://example.com/d",
          },
        ],
      },
    },
    slugs
  );
  assert.deepEqual(good, []);
});

test("unsafe URLs rejected: credentials, empty hosts, bad schemes", () => {
  for (const bad of [
    "https://user:pass@example.com/x",
    "https://user@example.com/x",
    "http://",
    "https://",
    "ftp://example.com/x",
    "javascript:alert(1)",
    "not a url",
  ]) {
    const errs = validateDetails("t", { support: { docsUrl: bad } }, slugs);
    assert.match(errs.join("\n"), /must start with http\(s\)/);
  }
  const good = validateDetails(
    "t",
    {
      support: {
        docsUrl: "https://example.com/docs?a=1&b=2",
        channels: [{ label: "Chat", url: "https://example.com:8443/chat" }],
      },
    },
    slugs
  );
  assert.deepEqual(good, []);
});

test("impossible calendar dates rejected, leap days honored", () => {
  for (const bad of ["2026-02-30", "2025-02-29", "2026-13-01", "2026-00-10"]) {
    const errs = validateEvidence("t", {
      facts: [
        {
          field: "details.setup",
          sourceUrl: "https://example.com/d",
          observedAt: bad,
          attribution: "publisher",
        },
      ],
    });
    assert.match(errs.join("\n"), /must be an ISO date/, bad);
  }
  const good = validateEvidence("t", {
    facts: [
      {
        field: "details.setup",
        sourceUrl: "https://example.com/d",
        observedAt: "2024-02-29",
        attribution: "publisher",
      },
    ],
  });
  assert.deepEqual(good, []);
});

test("instructions require sourceUrl", () => {
  const errs = validateDetails(
    "t",
    {
      setup: {
        instructions: [
          {
            label: "x",
            target: "y",
            kind: "link",
            value: "https://example.com/d",
          },
        ],
      },
    },
    slugs
  );
  assert.match(errs.join("\n"), /sourceUrl/);
});

test("screenshot requires alt, demo does not", () => {
  const bad = validateDetails(
    "t",
    { media: [{ kind: "screenshot", url: "https://example.com/s.png" }] },
    slugs
  );
  assert.match(bad.join("\n"), /alt.*required/);
  const good = validateDetails(
    "t",
    { media: [{ kind: "demo", url: "https://example.com/d" }] },
    slugs
  );
  assert.deepEqual(good, []);
  const wrongKind = validateDetails(
    "t",
    { media: [{ kind: "photo", url: "https://example.com/s.png" }] },
    slugs
  );
  assert.match(wrongKind.join("\n"), /screenshot or demo/);
});

test("benchmark value must be a finite number", () => {
  const bad = validateEvidence("t", {
    benchmarks: [
      {
        metric: "m",
        value: "80",
        scale: "0-100",
        sourceUrl: "https://example.com/b",
        measuredAt: "2026-01-01",
        target: "v1",
        methodologyUrl: "https://example.com/m",
      },
    ],
  });
  assert.match(bad.join("\n"), /finite number/);
});

test("alternatives resolve against the catalog slug index", () => {
  const good = validateDetails(
    "t",
    {
      alternatives: [
        { category: "skills", slug: "superpowers", reason: "Same area" },
      ],
    },
    slugs
  );
  assert.deepEqual(good, []);
  const bad = validateDetails(
    "t",
    {
      alternatives: [
        { category: "skills", slug: "no-such-entry", reason: "Missing" },
      ],
    },
    slugs
  );
  assert.match(bad.join("\n"), /unknown skills\/no-such-entry/);
  const many = validateDetails(
    "t",
    {
      alternatives: [0, 1, 2, 3, 4].map((i) => ({
        category: "skills",
        slug: "superpowers",
        reason: `r${i}`,
      })),
    },
    slugs
  );
  assert.match(many.join("\n"), /at most 4/);
});

test("env vars need descriptions; tool effects stay optional", () => {
  const bad = validateCategoryDetails("t", "containers", {
    containers: { environment: [{ name: "TOKEN" }] },
  });
  assert.match(bad.join("\n"), /description/);
  const good = validateCategoryDetails("t", "servers", {
    servers: {
      tools: [{ name: "search", description: "Searches" }],
      resources: [{ name: "r", description: "A resource" }],
    },
  });
  assert.deepEqual(good, []);
});

test("collector refresh preserves curated metadata", () => {
  // Mirrors the collector contract: refresh overwrites only collector-owned
  // keys, never details / categoryDetails / evidence.
  const before = fixture("containers.complete.json");
  const refreshed = structuredClone(before);
  const owned: Record<string, unknown> = {
    stats: { stars: 42 },
    releases: [],
    repo: "example/fixture",
  };
  for (const [k, v] of Object.entries(owned)) {
    (refreshed as unknown as Record<string, unknown>)[k] = v;
  }
  assert.deepEqual(refreshed.details, before.details);
  assert.deepEqual(refreshed.categoryDetails, before.categoryDetails);
  assert.deepEqual(refreshed.evidence, before.evidence);
});

test("collectors never assign curated metadata keys", () => {
  for (const file of ["collector/collect.mjs", "collector/enrich.mjs"]) {
    const src = readFileSync(join(here, "..", file), "utf8");
    for (const key of ["details", "categoryDetails", "evidence"]) {
      assert.doesNotMatch(src, new RegExp(`\\b(entry|cur)\\.${key}\\s*=`));
    }
  }
});
