import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
// Exercise the real TSX components without adding a test runner dependency.
for (const extension of [".tsx", ".ts"]) {
  require.extensions[extension] = (module, filename) => {
    const result = ts.transpileModule(readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
      fileName: filename,
    });
    Reflect.get(module, "_compile").call(module, result.outputText, filename);
  };
}
const listingModule: typeof import("../src/components/Listing") = require("../src/components/Listing.tsx");
const Listing = listingModule.default;

test("alternatives use category plus slug and skip broken curated references", () => {
  const resolve = listingModule.resolveAlternatives;
  assert.equal(
    typeof resolve,
    "function",
    "listing alternatives resolver exists"
  );
  const source = {
    slug: "same",
    name: "Source",
    description: "Source",
    url: "https://example.com",
    tags: ["coding"],
    details: {
      alternatives: [
        { category: "tools", slug: "missing", reason: "Broken" },
        { category: "tools", slug: "same", reason: "Offline option" },
      ],
    },
  };
  const result = resolve(source, "skills", [
    { id: "skills", label: "Skills", items: [source] },
    {
      id: "tools",
      label: "Tools",
      items: [{ ...source, name: "Other", details: undefined }],
    },
  ]);
  assert.deepEqual(
    result.map((r) => [r.href, r.reason]),
    [["/tools/same", "Offline option"]]
  );
});

test("organic fallback alternatives are deterministic and capped at four", () => {
  const source = {
    slug: "source",
    name: "Source",
    description: "Source",
    url: "https://example.com",
    tags: [],
  };
  const catalog = [
    {
      id: "tools",
      label: "Tools",
      items: [
        source,
        ...["a", "b", "c", "d", "e"].map((slug) => ({
          ...source,
          slug,
          name: slug,
        })),
      ],
    },
  ];
  assert.deepEqual(
    listingModule
      .resolveAlternatives(source, "tools", catalog)
      .map((r) => r.href),
    ["/tools/a", "/tools/b", "/tools/c", "/tools/d"]
  );
});

function render(extra = {}, category = "tools", slots = {}) {
  const entry = {
    slug: "example",
    name: "Example resource",
    description: "A useful resource.",
    url: "https://example.com",
    tags: [],
    ...extra,
  };
  return renderToStaticMarkup(
    React.createElement(Listing, {
      ...entry,
      category,
      entry,
      features: [],
      highlights: [],
      strengths: [],
      tradeoffs: [],
      pricing: [],
      builtWith: [],
      similar: [],
      ...slots,
    })
  );
}

test("legacy model facts and activity stay before alternatives", () => {
  const html = render({ specs: { contextLength: 12345 } }, "models", {
    modelFacts: React.createElement("p", null, "Context window 12345"),
    activity: React.createElement("p", null, "Historical activity"),
    similar: [
      {
        href: "/models/other",
        name: "Alternative model",
        description: "Other model",
      },
    ],
  });
  assert.ok(
    html.includes("Context window 12345"),
    "legacy model facts preserved"
  );
  assert.ok(
    html.indexOf("Context window 12345") < html.indexOf('id="getting-started"')
  );
  assert.ok(html.includes("Historical activity"), "activity preserved");
  assert.ok(
    html.indexOf("Historical activity") < html.indexOf('id="alternatives"')
  );
});

test("sparse listings explain critical unknowns without inventing setup or reviews", () => {
  const html = render();
  for (const label of [
    "Compatibility",
    "Requirements",
    "Pricing",
    "Data handling",
    "Last verified",
  ]) {
    assert.ok(html.includes(label), label);
  }
  assert.match(html, /Not provided/);
  assert.doesNotMatch(html, /Your rating|1-Click|Advertisement|Sponsored/);
});

test("overview exposes use cases and limitations before setup", () => {
  const html = render({
    details: {
      bestFor: ["Local coding"],
      notSuitedFor: ["Unattended production changes"],
      compatibility: [{ kind: "runtime", name: "Node.js", versions: "24+" }],
      requirements: [
        { kind: "account", description: "Provider account required" },
      ],
      setup: {
        difficulty: "beginner",
        estimatedMinutes: 5,
        steps: ["Read the documentation"],
      },
    },
  });
  for (const text of [
    "Local coding",
    "Unattended production changes",
    "Node.js",
    "24+",
    "Provider account required",
    "5 minutes",
  ]) {
    assert.ok(html.includes(text), text);
  }
  assert.ok(
    html.indexOf("Unattended production changes") <
      html.indexOf('id="getting-started"')
  );
});

test("zero pricing and paid dependencies remain distinct", () => {
  const html = render({
    details: {
      cost: {
        model: "free",
        plans: [
          { name: "Community", amount: 0, currency: "USD", unit: "month" },
        ],
        externalCosts: ["Model API billed separately"],
      },
    },
  });
  assert.match(html, /Community/);
  assert.match(html, /0/);
  assert.match(html, /USD/);
  assert.match(html, /Model API billed separately/);
});

test("tool facts distinguish explicit false from unknown", () => {
  const html = render({
    categoryDetails: {
      tools: {
        offlineSupport: false,
        accountRequired: true,
        exportFormats: ["JSON"],
      },
    },
  });
  assert.match(html, /Offline support/);
  assert.match(html, /Not supported/);
  assert.match(html, /Account required/);
  assert.match(html, /JSON/);
});

test("category-specific facts do not leak between categories", () => {
  const html = render(
    {
      categoryDetails: {
        tools: { integrations: ["Should not appear"] },
        skills: { format: "SKILL.md", allowedTools: ["Read"] },
      },
    },
    "skills"
  );
  assert.match(html, /SKILL.md/);
  assert.match(html, /Read/);
  assert.doesNotMatch(html, /Should not appear/);
});

for (const [category, data, texts] of [
  [
    "agents",
    {
      autonomy: "Approval required",
      memory: "Session only",
      triggers: ["Manual"],
    },
    ["Approval required", "Session only", "Manual"],
  ],
  [
    "containers",
    {
      registry: "ghcr.io",
      digest: "sha256:abc",
      rootless: false,
      architectures: ["arm64"],
      requiredPrivileges: ["None"],
    },
    ["ghcr.io", "sha256:abc", "Rootless", "Not supported", "arm64"],
  ],
  [
    "servers",
    {
      transport: "Streamable HTTP",
      hosting: "remote",
      tools: [{ name: "send", description: "Send a message", effect: "write" }],
    },
    ["Streamable HTTP", "send", "write"],
  ],
  [
    "models",
    {
      provider: "Example provider",
      toolCalling: false,
      structuredOutput: true,
      hardwareRequirements: "16 GB VRAM",
    },
    ["Example provider", "Tool calling", "Not supported", "16 GB VRAM"],
  ],
] as const) {
  test(`${category} renders its own useful technical facts`, () => {
    const html = render({ categoryDetails: { [category]: data } }, category);
    for (const text of texts) assert.ok(html.includes(text), text);
  });
}

test("setup uses supplied exact instructions and escaped placeholders", () => {
  const html = render({
    details: {
      setup: {
        instructions: [
          {
            label: "Local install",
            target: "Terminal",
            kind: "command",
            value: "example --key <API_KEY>",
            sourceUrl: "https://example.com/docs",
          },
        ],
      },
    },
  });
  assert.match(html, /example --key &lt;API_KEY&gt;/);
  assert.match(html, /Terminal/);
  assert.match(html, /Copy/);
  assert.doesNotMatch(html, /href="(?:cursor:|vscode:)|npx -y/);
});

test("media is descriptive and does not preload an external demo", () => {
  const html = render({
    details: {
      media: [
        {
          kind: "screenshot",
          url: "https://example.com/screen.png",
          alt: "Editor with result",
        },
        {
          kind: "demo",
          url: "https://example.com/demo",
          caption: "Watch the walkthrough",
        },
      ],
    },
  });
  assert.match(html, /alt="Editor with result"/);
  assert.match(html, /Watch the walkthrough/);
  assert.doesNotMatch(html, /<iframe|<video|autoplay/);
});

test("verification identifies checked fields without claiming all facts are verified", () => {
  const html = render({
    evidence: {
      verification: {
        checkedAt: "2026-11-01",
        fields: ["details.setup"],
        method: "Checked upstream documentation",
      },
      facts: [
        {
          field: "details.setup",
          sourceUrl: "https://example.com/docs",
          observedAt: "2026-11-01",
          attribution: "publisher",
        },
      ],
    },
  });
  assert.match(html, /2026-11-01/);
  assert.match(html, /details.setup/);
  assert.match(html, /Checked upstream documentation/);
  assert.match(html, /https:\/\/example.com\/docs/);
  assert.doesNotMatch(html, /Verified safe|Security verified/);
});

test("setup-only verification leaves pricing and tool claims individually unverified", () => {
  const html = render({
    details: { setup: { steps: ["Read docs"] }, cost: { model: "free" } },
    categoryDetails: {
      tools: {
        offlineSupport: false,
        accessibility: "Publisher keyboard claim",
      },
    },
    evidence: {
      verification: {
        checkedAt: "2026-11-01",
        fields: ["details.setup"],
        method: "Read docs",
      },
      facts: [
        {
          field: "categoryDetails.tools.offlineSupport",
          sourceUrl: "https://example.com/offline",
          observedAt: "2026-11-01",
          attribution: "publisher",
        },
      ],
    },
  });
  assert.match(html, /Not supported<\/dd>|Not supported/);
  assert.ok(
    html.includes(
      'aria-label="Source for categoryDetails.tools.offlineSupport: publisher"'
    )
  );
  assert.ok(html.includes('id="fact-source-0"'));
  assert.ok(
    (html.match(/Not verified/g) || []).length >= 3,
    "price, offline and accessibility each need unverified labels"
  );
});

test("security and benchmark evidence name target, source, date and method", () => {
  const html = render({
    evidence: {
      security: [
        {
          type: "scan",
          sourceUrl: "https://example.com/scan",
          checkedAt: "2026-11-01",
          target: "sha256:old",
          result: "2 high findings",
          counts: { high: 2 },
        },
      ],
      benchmarks: [
        {
          metric: "Accuracy",
          value: 80,
          scale: "%",
          sourceUrl: "https://example.com/score",
          measuredAt: "2026-11-01",
          target: "v1",
          methodologyUrl: "https://example.com/method",
        },
      ],
    },
  });
  for (const text of [
    "sha256:old",
    "2 high findings",
    "2026-11-01",
    "Accuracy",
    "v1",
    "https://example.com/method",
  ])
    assert.ok(html.includes(text), text);
  assert.doesNotMatch(html, /Verified safe|Vulnerability-free/);
});

test("a scan for a different image target does not imply coverage of the listed digest", () => {
  const html = render(
    {
      categoryDetails: { containers: { digest: "sha256:current" } },
      evidence: {
        security: [
          {
            type: "scan",
            sourceUrl: "https://example.com/scan",
            checkedAt: "2026-11-01",
            target: "sha256:old",
            result: "No high findings",
          },
        ],
      },
    },
    "containers"
  );
  assert.match(html, /does not cover the listed image digest/);
});
