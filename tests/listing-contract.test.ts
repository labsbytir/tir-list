import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  collectEntryPaths,
  restoreCuratedFields,
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
    assert.deepEqual(
      validateEvidence(`${category}/fixture`, e.evidence, e),
      []
    );
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

test("credential-bearing assignments need placeholders, any prefix", () => {
  for (const value of [
    '{"headers": {"Authorization": "Bearer abc123"}}',
    '{"token": "abc123"}',
    "password=s3cr3t-live-value",
    "apiKey: abc123",
  ]) {
    const errs = validateDetails(
      "t",
      {
        setup: {
          instructions: [
            {
              label: "x",
              target: "y",
              kind: "configuration",
              value,
              sourceUrl: "https://example.com/d",
            },
          ],
        },
      },
      slugs
    );
    assert.match(errs.join("\n"), /live-looking value/, value);
  }
  for (const value of [
    '{"token": "<YOUR_TOKEN>"}',
    '{"headers": {"Authorization": "Bearer <API_TOKEN>"}}',
    "password: <DB_PASSWORD>",
    "apiKey: YOUR_API_KEY",
  ]) {
    const errs = validateDetails(
      "t",
      {
        setup: {
          instructions: [
            {
              label: "x",
              target: "y",
              kind: "configuration",
              value,
              sourceUrl: "https://example.com/d",
            },
          ],
        },
      },
      slugs
    );
    assert.deepEqual(errs, [], value);
  }
});

test("evidence source URLs reject embedded credentials", () => {
  const errs = validateEvidence(
    "t",
    {
      facts: [
        {
          field: "details.setup",
          sourceUrl: "https://user:pass@example.com/report",
          observedAt: "2026-01-10",
          attribution: "publisher",
        },
      ],
    },
    {
      slug: "x",
      details: { setup: { difficulty: "beginner" } },
    }
  );
  assert.match(errs.join("\n"), /must start with http\(s\)/);
});

test("example output and environment must be strings", () => {
  const bad = validateDetails(
    "t",
    {
      setup: {
        example: {
          input: "do x",
          output: { text: "done" },
          environment: 42,
        },
      },
    },
    slugs
  );
  assert.match(
    bad.join("\n"),
    /"details\.setup\.example\.output" must be a string/
  );
  assert.match(
    bad.join("\n"),
    /"details\.setup\.example\.environment" must be a string/
  );
});

test("evidence paths must exist in the entry, indexed rows included", () => {
  const entry = {
    slug: "x",
    details: { setup: { difficulty: "beginner" } },
  };
  const badField = validateEvidence(
    "t",
    {
      facts: [
        {
          field: "details.nonexistent",
          sourceUrl: "https://example.com/d",
          observedAt: "2026-01-10",
          attribution: "publisher",
        },
      ],
    },
    entry
  );
  assert.match(badField.join("\n"), /names no path in this entry/);
  const badVerification = validateEvidence(
    "t",
    {
      verification: {
        checkedAt: "2026-02-01",
        fields: ["details.setup", "details.pricing"],
        method: "manual",
      },
    },
    entry
  );
  assert.match(badVerification.join("\n"), /names no path in this entry/);
  const good = validateEvidence(
    "t",
    {
      facts: [
        {
          field: "details.setup",
          sourceUrl: "https://example.com/d",
          observedAt: "2026-01-10",
          attribution: "publisher",
        },
      ],
      verification: {
        checkedAt: "2026-02-01",
        fields: ["details.setup"],
        method: "manual",
      },
    },
    entry
  );
  assert.deepEqual(good, []);
});

test("security and benchmark dates reject the future", () => {
  const entry = { slug: "x" };
  const bad = validateEvidence(
    "t",
    {
      security: [
        {
          type: "scan",
          sourceUrl: "https://example.com/s",
          checkedAt: "2999-01-01",
          target: "v1",
          result: "clean",
        },
      ],
      benchmarks: [
        {
          metric: "m",
          value: 80,
          scale: "0-100",
          sourceUrl: "https://example.com/b",
          measuredAt: "2999-06-01",
          target: "v1",
          methodologyUrl: "https://example.com/m",
        },
      ],
    },
    entry
  );
  assert.match(
    bad.join("\n"),
    /"evidence\.security\[0\]\.checkedAt" must not be in the future/
  );
  assert.match(
    bad.join("\n"),
    /"evidence\.benchmarks\[0\]\.measuredAt" must not be in the future/
  );
});

test("install deep links: extensions and Cursor MCP install form", () => {
  const mcp = (config: unknown, extra = ""): string => {
    const b64 = Buffer.from(JSON.stringify(config)).toString("base64");
    return `cursor://anysphere.cursor-deeplink/mcp/install?name=Fixture&config=${encodeURIComponent(b64)}${extra}`;
  };
  const linkErrs = (value: string): string[] =>
    validateDetails(
      "t",
      {
        setup: {
          instructions: [
            {
              label: "x",
              target: "y",
              kind: "link",
              value,
              sourceUrl: "https://example.com/d",
            },
          ],
        },
      },
      slugs
    );
  for (const value of [
    "vscode:extension/publisher.name",
    "cursor:extension/pub-1.my_tool",
    mcp({ url: "https://mcp.example.com/sse" }),
    mcp({
      command: "npx",
      args: ["-y", "example-mcp"],
      env: { API_KEY: "<YOUR_KEY>" },
    }),
  ]) {
    assert.deepEqual(linkErrs(value), [], value);
  }
  const live = Buffer.from(
    JSON.stringify({
      url: "https://mcp.example.com",
      headers: { Authorization: "Bearer abc123" },
    })
  ).toString("base64");
  const cases: Array<[string, RegExp]> = [
    ["vscode://file/x", /allowlisted install deep link/],
    ["myapp://install/x", /allowlisted install deep link/],
    ["vscode:extension/noid", /allowlisted install deep link/],
    [
      "cursor://anysphere.cursor-deeplink/other?name=F&config=e30=",
      /must be cursor:\/\/anysphere\.cursor-deeplink\/mcp\/install/,
    ],
    [
      "cursor://anysphere.cursor-deeplink/mcp/install?name=F&config=!!!",
      /not valid base64/,
    ],
    [
      `cursor://anysphere.cursor-deeplink/mcp/install?name=F&config=${Buffer.from("not json").toString("base64")}`,
      /not valid JSON/,
    ],
    [
      `cursor://anysphere.cursor-deeplink/mcp/install?name=A&name=B&config=${Buffer.from("{}").toString("base64")}`,
      /exactly one nonempty name/,
    ],
    [
      "cursor://anysphere.cursor-deeplink/mcp/install?name=F",
      /exactly one nonempty config/,
    ],
    [mcp({ env: { FOO: "bar" } }), /needs a url or a command/],
    [mcp({ url: "https://u:p@mcp.example.com/" }), /without credentials/],
    [
      `cursor://anysphere.cursor-deeplink/mcp/install?name=F&config=${encodeURIComponent(live)}`,
      /live-looking value/,
    ],
  ];
  for (const [value, re] of cases) {
    assert.match(linkErrs(value).join("\n"), re, value);
  }
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

test("collector overwrite preserves curated fields via production helper", () => {
  // The same restoreCuratedFields that collector/collect.mjs calls on its
  // --overwrite write path.
  const existing = {
    slug: "fixture-container",
    description: "Old",
    details: { cost: { model: "free" } },
    categoryDetails: { containers: { rootless: false } },
    evidence: { facts: [] },
  };
  const incoming = {
    slug: "fixture-container",
    description: "Refreshed from source",
    stats: { stars: 42 },
  };
  const merged = restoreCuratedFields(incoming, existing) as Record<
    string,
    unknown
  >;
  assert.equal(merged.description, "Refreshed from source");
  assert.deepEqual(merged.stats, { stars: 42 });
  assert.deepEqual(merged.details, existing.details);
  assert.deepEqual(merged.categoryDetails, existing.categoryDetails);
  assert.deepEqual(merged.evidence, existing.evidence);
});

test("merge helper never drops incoming curated fields it was not given", () => {
  const merged = restoreCuratedFields(
    { slug: "x", details: { cost: { model: "free" } } },
    { slug: "x", description: "Old" }
  ) as Record<string, unknown>;
  assert.deepEqual(merged.details, { cost: { model: "free" } });
});

test("merge helper composes with collector fill-missing merge", () => {
  // Mirrors the collect.mjs dedup-merge write path: fill missing
  // collector-owned keys on a copy of the stored entry, then restore.
  const stored = {
    slug: "x",
    description: "Hand-written",
    details: { cost: { model: "free" } },
    links: { website: "https://example.com/x" },
  };
  const incoming = {
    description: "Collected",
    links: { github: "https://github.com/example/x" },
    stats: { stars: 7 },
  };
  const cur = JSON.parse(JSON.stringify(stored)) as Record<string, unknown>;
  for (const k of ["description"]) {
    if (!cur[k] && (incoming as Record<string, unknown>)[k]) {
      cur[k] = (incoming as Record<string, unknown>)[k];
    }
  }
  cur.links = {
    ...((incoming as Record<string, unknown>).links as Record<string, unknown>),
    ...((cur.links ?? {}) as Record<string, unknown>),
  };
  const written = restoreCuratedFields(cur, stored) as Record<string, unknown>;
  assert.equal(written.description, "Hand-written");
  assert.deepEqual(written.details, { cost: { model: "free" } });
  assert.deepEqual(
    (written.links as Record<string, unknown>).github,
    "https://github.com/example/x"
  );
});
