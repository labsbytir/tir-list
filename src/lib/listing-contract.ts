// Pure validators for the listing-page-content contract (design.md §3-§7).
// No Astro/Vite imports: runnable under node type-stripping so both
// scripts/validate-data.mjs and tests/ import this one module.
// All new fields are optional; absent sections are valid (sparse records).
// Zero and false are real values: every check uses `!== undefined`, never
// truthiness. Secret detection is bounded (see SECRET_PATTERNS).

export type SlugIndex = Map<string, Set<string>>;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && !!v.trim();

// Parsed-URL check, not a prefix regex: rejects unparseable values, empty
// hosts, and embedded username/password (credential leakage). http(s) only.
const isHttpUrl = (v: unknown): v is string => {
  if (typeof v !== "string") return false;
  let u: URL;
  try {
    u = new URL(v);
  } catch {
    return false;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return false;
  if (!u.hostname) return false;
  if (u.username || u.password) return false;
  return true;
};

// Strict calendar date: the leading YYYY-MM-DD must exist on the calendar.
// Date.parse rolls 2026-02-30 over into March, so verify via Date.UTC.
const isISODate = (v: unknown): v is string => {
  if (typeof v !== "string") return false;
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m || Number.isNaN(Date.parse(v))) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return false;
  return new Date(Date.UTC(y, mo - 1, d)).getUTCDate() === d;
};

const isFutureDate = (v: unknown): boolean =>
  isISODate(v) && Date.parse(v) > Date.now();

// Credential-bearing assignments (key: value or key=value) anywhere in
// authored config/command/example text. Independent of SECRET_PATTERNS:
// even an unprefixed live value such as "Bearer abc123" must fail.
const CREDENTIAL_ASSIGN_SRC =
  "[\"']?(authorization|api[-_ ]?key|client[-_ ]?secret|passwd|password|secret|token|bearer)[\"']?\\s*[:=]\\s*[\"']?([^\"'}\\n]+)";
function isPlaceholderValue(v: string): boolean {
  if (/<[^<>]+>/.test(v)) return true;
  const t = v.toLowerCase();
  if (/(example|changeme|placeholder|x{3,}|\*{3,}|dummy|sample)/.test(t))
    return true;
  return /your/.test(t) && /(token|key|password|secret)/.test(t);
}
function checkCredentialPlaceholders(
  errs: string[],
  where: string,
  path: string,
  v: unknown
): void {
  if (typeof v !== "string") return;
  for (const m of v.matchAll(new RegExp(CREDENTIAL_ASSIGN_SRC, "gi"))) {
    if (!isPlaceholderValue(m[2].trim()))
      errs.push(
        `${where}: "${path}" assigns "${m[1]}" a live-looking value; use a named placeholder`
      );
  }
}

// Verified install deep links for supported clients. Scope: validating
// authored examples only; links are never inferred or generated.
// - Editor extensions: vscode:extension/<publisher>.<name>,
//   cursor:extension/<publisher>.<name>.
// - MCP servers: the officially documented Cursor install link only
//   (https://cursor.com/docs/context/mcp/install-links):
//   cursor://anysphere.cursor-deeplink/mcp/install?name=$NAME&config=$BASE64.
//   No vscode:mcp target is documented; none is guessed.
const EXTENSION_INSTALL_LINK =
  /^(vscode|cursor):extension\/[a-z0-9][a-z0-9-_]*\.[a-z0-9][a-z0-9-_]*$/i;
const BASE64_STRICT = /^[A-Za-z0-9+/\-_]*={0,2}$/;

function validateCursorMcpLink(
  errs: string[],
  where: string,
  path: string,
  value: string
): void {
  let u: URL;
  try {
    u = new URL(value);
  } catch {
    errs.push(`${where}: "${path}" is not a parseable Cursor install link`);
    return;
  }
  if (
    u.protocol !== "cursor:" ||
    u.hostname !== "anysphere.cursor-deeplink" ||
    u.pathname !== "/mcp/install"
  ) {
    errs.push(
      `${where}: "${path}" must be cursor://anysphere.cursor-deeplink/mcp/install`
    );
    return;
  }
  // Split the raw query: URLSearchParams turns base64 "+" into spaces.
  const params = new Map<string, string[]>();
  for (const part of u.search.slice(1).split("&")) {
    if (!part) continue;
    const eq = part.indexOf("=");
    const k = eq < 0 ? part : part.slice(0, eq);
    const v = eq < 0 ? "" : part.slice(eq + 1);
    let decoded: string;
    try {
      decoded = decodeURIComponent(v);
    } catch {
      errs.push(`${where}: "${path}" has a malformed query encoding`);
      return;
    }
    params.set(k, [...(params.get(k) ?? []), decoded]);
  }
  for (const k of params.keys()) {
    if (k !== "name" && k !== "config")
      errs.push(`${where}: "${path}" rejects unknown parameter "${k}"`);
  }
  const names = params.get("name") ?? [];
  const configs = params.get("config") ?? [];
  if (names.length !== 1 || !names[0].trim())
    errs.push(`${where}: "${path}" needs exactly one nonempty name`);
  if (configs.length !== 1 || !configs[0])
    errs.push(`${where}: "${path}" needs exactly one nonempty config`);
  if (errs.length) return;
  const raw = configs[0];
  if (!BASE64_STRICT.test(raw) || raw.length % 4 !== 0) {
    errs.push(`${where}: "${path}" config is not valid base64`);
    return;
  }
  let config: unknown;
  try {
    config = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
  } catch {
    errs.push(`${where}: "${path}" config is not valid JSON`);
    return;
  }
  if (typeof config !== "object" || config === null || Array.isArray(config)) {
    errs.push(`${where}: "${path}" config must be a JSON object`);
    return;
  }
  const c = config as Record<string, unknown>;
  if (c.url !== undefined) {
    if (!isHttpUrl(c.url))
      errs.push(
        `${where}: "${path}" config url must be http(s) without credentials`
      );
  }
  if (c.command !== undefined && !isNonEmptyString(c.command))
    errs.push(`${where}: "${path}" config command must be a non-empty string`);
  if (c.args !== undefined) {
    if (
      !Array.isArray(c.args) ||
      !c.args.every((a) => typeof a === "string" && a.trim())
    )
      errs.push(
        `${where}: "${path}" config args must be an array of non-empty strings`
      );
  }
  if (c.env !== undefined) {
    if (
      typeof c.env !== "object" ||
      c.env === null ||
      Array.isArray(c.env) ||
      !Object.values(c.env).every((v) => typeof v === "string")
    )
      errs.push(`${where}: "${path}" config env must be an object of strings`);
  }
  if (c.url === undefined && c.command === undefined)
    errs.push(`${where}: "${path}" config needs a url or a command`);
  const text = JSON.stringify(c);
  if (looksLikeSecret(text))
    errs.push(
      `${where}: "${path}" config looks like a live secret; use a placeholder`
    );
  checkCredentialPlaceholders(errs, where, `${path} config`, text);
}
// Known live-secret prefixes. Complements the credential-key rule above.
const SECRET_PATTERNS: RegExp[] = [
  /ghp_[A-Za-z0-9]+/,
  /github_pat_[A-Za-z0-9_]+/,
  /sk-(live|test)-[A-Za-z0-9]+/,
  /AKIA[0-9A-Z]{16}/,
  /xox[bap]-[A-Za-z0-9-]+/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /AIza[0-9A-Za-z_-]{20,}/,
];

export function looksLikeSecret(v: unknown): boolean {
  return typeof v === "string" && SECRET_PATTERNS.some((re) => re.test(v));
}

function keys(
  errs: string[],
  where: string,
  path: string,
  obj: Record<string, unknown>,
  allowed: string[]
): void {
  for (const k of Object.keys(obj)) {
    if (!allowed.includes(k)) errs.push(`${where}: unknown key "${path}${k}"`);
  }
}

function stringArray(
  errs: string[],
  where: string,
  path: string,
  v: unknown
): void {
  if (!Array.isArray(v)) {
    errs.push(`${where}: "${path}" must be an array`);
    return;
  }
  v.forEach((s: unknown, i: number) => {
    if (!isNonEmptyString(s))
      errs.push(`${where}: "${path}[${i}]" must be a non-empty string`);
    else if (looksLikeSecret(s))
      errs.push(`${where}: "${path}[${i}]" looks like a live secret`);
  });
}

function checkSetup(errs: string[], where: string, s: unknown): void {
  if (!isRecord(s)) {
    errs.push(`${where}: "details.setup" must be an object`);
    return;
  }
  keys(errs, where, "details.setup.", s, [
    "difficulty",
    "estimatedMinutes",
    "steps",
    "instructions",
    "example",
  ]);
  if (
    s.difficulty !== undefined &&
    !["beginner", "intermediate", "advanced"].includes(s.difficulty as string)
  )
    errs.push(`${where}: "details.setup.difficulty" has an unknown value`);
  if (
    s.estimatedMinutes !== undefined &&
    (typeof s.estimatedMinutes !== "number" ||
      !Number.isFinite(s.estimatedMinutes) ||
      s.estimatedMinutes <= 0)
  )
    errs.push(
      `${where}: "details.setup.estimatedMinutes" must be a positive number`
    );
  if (s.steps !== undefined)
    stringArray(errs, where, "details.setup.steps", s.steps);
  if (s.instructions !== undefined) {
    if (!Array.isArray(s.instructions))
      errs.push(`${where}: "details.setup.instructions" must be an array`);
    else
      s.instructions.forEach((ins: unknown, i: number) => {
        const p = `details.setup.instructions[${i}]`;
        if (!isRecord(ins)) {
          errs.push(`${where}: "${p}" must be an object`);
          return;
        }
        keys(errs, where, `${p}.`, ins, [
          "label",
          "target",
          "kind",
          "value",
          "sourceUrl",
        ]);
        for (const k of ["label", "target", "value"])
          if (!isNonEmptyString(ins[k]))
            errs.push(`${where}: "${p}.${k}" must be a non-empty string`);
        if (
          ins.kind !== "command" &&
          ins.kind !== "configuration" &&
          ins.kind !== "link"
        )
          errs.push(`${where}: "${p}.kind" has an unknown value`);
        if (ins.kind === "link" && typeof ins.value === "string") {
          const http: boolean = isHttpUrl(ins.value);
          if (http) {
            // Public content URL.
          } else if (EXTENSION_INSTALL_LINK.test(ins.value)) {
            // Documented editor extension install target.
          } else if (ins.value.startsWith("cursor://")) {
            validateCursorMcpLink(errs, where, `${p}.value`, ins.value);
          } else {
            errs.push(
              `${where}: "${p}.value" link must be http(s) or an allowlisted install deep link`
            );
          }
        }
        if (looksLikeSecret(ins.value))
          errs.push(
            `${where}: "${p}.value" looks like a live secret; use a placeholder`
          );
        checkCredentialPlaceholders(errs, where, `${p}.value`, ins.value);
        if (!isHttpUrl(ins.sourceUrl))
          errs.push(`${where}: "${p}.sourceUrl" must start with http(s)`);
      });
  }
  if (s.example !== undefined) {
    if (!isRecord(s.example))
      errs.push(`${where}: "details.setup.example" must be an object`);
    else {
      keys(errs, where, "details.setup.example.", s.example, [
        "input",
        "output",
        "environment",
      ]);
      if (!isNonEmptyString(s.example.input))
        errs.push(
          `${where}: "details.setup.example.input" must be a non-empty string`
        );
      for (const k of ["output", "environment"])
        if (s.example[k] !== undefined && typeof s.example[k] !== "string")
          errs.push(`${where}: "details.setup.example.${k}" must be a string`);
      for (const k of ["input", "output", "environment"]) {
        if (s.example[k] !== undefined && looksLikeSecret(s.example[k]))
          errs.push(
            `${where}: "details.setup.example.${k}" looks like a live secret; use a placeholder`
          );
        checkCredentialPlaceholders(
          errs,
          where,
          `details.setup.example.${k}`,
          s.example[k]
        );
      }
    }
  }
}

function checkCost(errs: string[], where: string, c: unknown): void {
  if (!isRecord(c)) {
    errs.push(`${where}: "details.cost" must be an object`);
    return;
  }
  keys(errs, where, "details.cost.", c, [
    "model",
    "plans",
    "trial",
    "externalCosts",
  ]);
  if (
    c.model !== undefined &&
    ![
      "free",
      "freemium",
      "subscription",
      "usage-based",
      "paid-once",
      "contact-sales",
    ].includes(c.model as string)
  )
    errs.push(`${where}: "details.cost.model" has an unknown value`);
  if (c.plans !== undefined) {
    if (!Array.isArray(c.plans))
      errs.push(`${where}: "details.cost.plans" must be an array`);
    else
      c.plans.forEach((p: unknown, i: number) => {
        const q = `details.cost.plans[${i}]`;
        if (!isRecord(p)) {
          errs.push(`${where}: "${q}" must be an object`);
          return;
        }
        keys(errs, where, `${q}.`, p, [
          "name",
          "amount",
          "currency",
          "unit",
          "notes",
          "sourceUrl",
        ]);
        if (!isNonEmptyString(p.name))
          errs.push(`${where}: "${q}.name" must be a non-empty string`);
        if (p.amount !== undefined) {
          if (
            typeof p.amount !== "number" ||
            !Number.isFinite(p.amount) ||
            p.amount < 0
          )
            errs.push(
              `${where}: "${q}.amount" must be a non-negative finite number`
            );
          if (!isNonEmptyString(p.currency) || !isNonEmptyString(p.unit))
            errs.push(
              `${where}: "${q}" with an amount requires currency and unit`
            );
        }
        for (const k of ["currency", "unit", "notes"])
          if (p[k] !== undefined && !isNonEmptyString(p[k]))
            errs.push(`${where}: "${q}.${k}" must be a non-empty string`);
        if (p.sourceUrl !== undefined && !isHttpUrl(p.sourceUrl))
          errs.push(`${where}: "${q}.sourceUrl" must start with http(s)`);
      });
  }
  if (c.trial !== undefined && !isNonEmptyString(c.trial))
    errs.push(`${where}: "details.cost.trial" must be a non-empty string`);
  if (c.externalCosts !== undefined)
    stringArray(errs, where, "details.cost.externalCosts", c.externalCosts);
}

function checkDataHandling(errs: string[], where: string, h: unknown): void {
  if (!isRecord(h)) {
    errs.push(`${where}: "details.dataHandling" must be an object`);
    return;
  }
  keys(errs, where, "details.dataHandling.", h, [
    "processing",
    "retention",
    "permissions",
    "destinations",
    "privacyUrl",
  ]);
  if (
    h.processing !== undefined &&
    h.processing !== "local" &&
    h.processing !== "cloud" &&
    h.processing !== "hybrid"
  )
    errs.push(
      `${where}: "details.dataHandling.processing" has an unknown value`
    );
  if (h.retention !== undefined && !isNonEmptyString(h.retention))
    errs.push(
      `${where}: "details.dataHandling.retention" must be a non-empty string`
    );
  for (const k of ["permissions", "destinations"])
    if (h[k] !== undefined)
      stringArray(errs, where, `details.dataHandling.${k}`, h[k]);
  if (h.privacyUrl !== undefined && !isHttpUrl(h.privacyUrl))
    errs.push(
      `${where}: "details.dataHandling.privacyUrl" must start with http(s)`
    );
}

export function validateDetails(
  where: string,
  value: unknown,
  slugs: SlugIndex
): string[] {
  const errs: string[] = [];
  if (!isRecord(value)) return [`${where}: "details" must be an object`];
  const d = value;
  keys(errs, where, "details.", d, [
    "bestFor",
    "notSuitedFor",
    "compatibility",
    "requirements",
    "setup",
    "cost",
    "dataHandling",
    "maintainer",
    "support",
    "media",
    "alternatives",
  ]);
  if (d.bestFor !== undefined)
    stringArray(errs, where, "details.bestFor", d.bestFor);
  if (d.notSuitedFor !== undefined)
    stringArray(errs, where, "details.notSuitedFor", d.notSuitedFor);
  if (d.compatibility !== undefined) {
    if (!Array.isArray(d.compatibility))
      errs.push(`${where}: "details.compatibility" must be an array`);
    else
      d.compatibility.forEach((c: unknown, i: number) => {
        const p = `details.compatibility[${i}]`;
        if (!isRecord(c)) {
          errs.push(`${where}: "${p}" must be an object`);
          return;
        }
        keys(errs, where, `${p}.`, c, ["kind", "name", "versions"]);
        for (const k of ["kind", "name"])
          if (!isNonEmptyString(c[k]))
            errs.push(`${where}: "${p}.${k}" must be a non-empty string`);
        if (c.versions !== undefined && !isNonEmptyString(c.versions))
          errs.push(`${where}: "${p}.versions" must be a non-empty string`);
      });
  }
  if (d.requirements !== undefined) {
    if (!Array.isArray(d.requirements))
      errs.push(`${where}: "details.requirements" must be an array`);
    else
      d.requirements.forEach((r: unknown, i: number) => {
        const p = `details.requirements[${i}]`;
        if (!isRecord(r)) {
          errs.push(`${where}: "${p}" must be an object`);
          return;
        }
        keys(errs, where, `${p}.`, r, ["kind", "description"]);
        for (const k of ["kind", "description"])
          if (!isNonEmptyString(r[k]))
            errs.push(`${where}: "${p}.${k}" must be a non-empty string`);
      });
  }
  if (d.setup !== undefined) checkSetup(errs, where, d.setup);
  if (d.cost !== undefined) checkCost(errs, where, d.cost);
  if (d.dataHandling !== undefined)
    checkDataHandling(errs, where, d.dataHandling);
  if (d.maintainer !== undefined) {
    if (!isRecord(d.maintainer))
      errs.push(`${where}: "details.maintainer" must be an object`);
    else {
      keys(errs, where, "details.maintainer.", d.maintainer, [
        "name",
        "url",
        "status",
      ]);
      if (
        d.maintainer.name !== undefined &&
        !isNonEmptyString(d.maintainer.name)
      )
        errs.push(
          `${where}: "details.maintainer.name" must be a non-empty string`
        );
      if (d.maintainer.url !== undefined && !isHttpUrl(d.maintainer.url))
        errs.push(`${where}: "details.maintainer.url" must start with http(s)`);
      if (
        d.maintainer.status !== undefined &&
        !["active", "maintenance-only", "archived", "discontinued"].includes(
          d.maintainer.status as string
        )
      )
        errs.push(`${where}: "details.maintainer.status" has an unknown value`);
    }
  }
  if (d.support !== undefined) {
    if (!isRecord(d.support))
      errs.push(`${where}: "details.support" must be an object`);
    else {
      keys(errs, where, "details.support.", d.support, [
        "docsUrl",
        "channels",
        "tier",
        "responseCommitment",
      ]);
      if (d.support.docsUrl !== undefined && !isHttpUrl(d.support.docsUrl))
        errs.push(
          `${where}: "details.support.docsUrl" must start with http(s)`
        );
      if (d.support.channels !== undefined) {
        if (!Array.isArray(d.support.channels))
          errs.push(`${where}: "details.support.channels" must be an array`);
        else
          d.support.channels.forEach((ch: unknown, i: number) => {
            const p = `details.support.channels[${i}]`;
            if (!isRecord(ch)) {
              errs.push(`${where}: "${p}" must be an object`);
              return;
            }
            keys(errs, where, `${p}.`, ch, ["label", "url"]);
            if (!isNonEmptyString(ch.label))
              errs.push(`${where}: "${p}.label" must be a non-empty string`);
            if (!isHttpUrl(ch.url))
              errs.push(`${where}: "${p}.url" must start with http(s)`);
          });
      }
      for (const k of ["tier", "responseCommitment"])
        if (d.support[k] !== undefined && !isNonEmptyString(d.support[k]))
          errs.push(
            `${where}: "details.support.${k}" must be a non-empty string`
          );
    }
  }
  if (d.media !== undefined) {
    if (!Array.isArray(d.media))
      errs.push(`${where}: "details.media" must be an array`);
    else
      d.media.forEach((m: unknown, i: number) => {
        const p = `details.media[${i}]`;
        if (!isRecord(m)) {
          errs.push(`${where}: "${p}" must be an object`);
          return;
        }
        keys(errs, where, `${p}.`, m, ["kind", "url", "alt", "caption"]);
        if (m.kind !== "screenshot" && m.kind !== "demo")
          errs.push(`${where}: "${p}.kind" must be screenshot or demo`);
        if (!isHttpUrl(m.url))
          errs.push(`${where}: "${p}.url" must start with http(s)`);
        if (m.kind === "screenshot" && !isNonEmptyString(m.alt))
          errs.push(`${where}: "${p}.alt" is required for screenshots`);
        for (const k of ["alt", "caption"])
          if (m[k] !== undefined && typeof m[k] !== "string")
            errs.push(`${where}: "${p}.${k}" must be a string`);
      });
  }
  if (d.alternatives !== undefined) {
    if (!Array.isArray(d.alternatives))
      errs.push(`${where}: "details.alternatives" must be an array`);
    else {
      if (d.alternatives.length > 4)
        errs.push(
          `${where}: "details.alternatives" must have at most 4 entries`
        );
      d.alternatives.forEach((a: unknown, i: number) => {
        const p = `details.alternatives[${i}]`;
        if (!isRecord(a)) {
          errs.push(`${where}: "${p}" must be an object`);
          return;
        }
        keys(errs, where, `${p}.`, a, ["category", "slug", "reason"]);
        if (
          !isNonEmptyString(a.category) ||
          !isNonEmptyString(a.slug) ||
          !isNonEmptyString(a.reason)
        )
          errs.push(
            `${where}: "${p}" needs non-empty category, slug, and reason`
          );
        else if (!slugs.get(a.category as string)?.has(a.slug as string))
          errs.push(`${where}: "${p}" targets unknown ${a.category}/${a.slug}`);
      });
    }
  }
  return errs;
}

const CATEGORY_KEYS = [
  "skills",
  "agents",
  "containers",
  "servers",
  "models",
  "tools",
] as const;

function stringArrayOpt(
  errs: string[],
  where: string,
  path: string,
  obj: Record<string, unknown>,
  key: string
): void {
  if (obj[key] !== undefined)
    stringArray(errs, where, `${path}.${key}`, obj[key]);
}

function textOpt(
  errs: string[],
  where: string,
  path: string,
  obj: Record<string, unknown>,
  key: string
): void {
  if (obj[key] !== undefined && !isNonEmptyString(obj[key]))
    errs.push(`${where}: "${path}.${key}" must be a non-empty string`);
}

export function validateCategoryDetails(
  where: string,
  category: string,
  value: unknown
): string[] {
  const errs: string[] = [];
  if (!isRecord(value))
    return [`${where}: "categoryDetails" must be an object`];
  keys(errs, where, "categoryDetails.", value, [...CATEGORY_KEYS]);
  for (const k of Object.keys(value)) {
    if (k !== category && (CATEGORY_KEYS as readonly string[]).includes(k))
      errs.push(
        `${where}: "categoryDetails.${k}" does not belong to ${category}`
      );
  }
  const path = `categoryDetails.${category}`;
  const sub = value[category];
  if (sub === undefined) return errs;
  if (!isRecord(sub)) {
    errs.push(`${where}: "${path}" must be an object`);
    return errs;
  }
  switch (category) {
    case "skills": {
      keys(errs, where, `${path}.`, sub, ["format", "allowedTools"]);
      textOpt(errs, where, path, sub, "format");
      stringArrayOpt(errs, where, path, sub, "allowedTools");
      break;
    }
    case "agents": {
      keys(errs, where, `${path}.`, sub, [
        "tasks",
        "environments",
        "triggers",
        "modelRequirements",
        "integrations",
        "deploymentOptions",
        "autonomy",
        "approvalControls",
        "memory",
      ]);
      for (const k of [
        "tasks",
        "environments",
        "triggers",
        "modelRequirements",
        "integrations",
        "deploymentOptions",
      ])
        stringArrayOpt(errs, where, path, sub, k);
      for (const k of ["autonomy", "approvalControls", "memory"])
        textOpt(errs, where, path, sub, k);
      break;
    }
    case "containers": {
      keys(errs, where, `${path}.`, sub, [
        "registry",
        "repository",
        "tag",
        "digest",
        "baseOs",
        "license",
        "versionPolicy",
        "updateCadence",
        "architectures",
        "requiredPrivileges",
        "rootless",
        "sizes",
        "ports",
        "volumes",
        "environment",
      ]);
      for (const k of [
        "registry",
        "repository",
        "tag",
        "digest",
        "baseOs",
        "license",
        "versionPolicy",
        "updateCadence",
      ])
        textOpt(errs, where, path, sub, k);
      for (const k of [
        "architectures",
        "requiredPrivileges",
        "ports",
        "volumes",
      ])
        stringArrayOpt(errs, where, path, sub, k);
      if (sub.rootless !== undefined && typeof sub.rootless !== "boolean")
        errs.push(`${where}: "${path}.rootless" must be a boolean`);
      if (sub.sizes !== undefined) {
        if (!Array.isArray(sub.sizes))
          errs.push(`${where}: "${path}.sizes" must be an array`);
        else
          (sub.sizes as unknown[]).forEach((s: unknown, i: number) => {
            const p = `${path}.sizes[${i}]`;
            if (!isRecord(s)) {
              errs.push(`${where}: "${p}" must be an object`);
              return;
            }
            keys(errs, where, `${p}.`, s, ["architecture", "bytes", "basis"]);
            if (!isNonEmptyString(s.architecture))
              errs.push(
                `${where}: "${p}.architecture" must be a non-empty string`
              );
            if (
              typeof s.bytes !== "number" ||
              !Number.isFinite(s.bytes) ||
              s.bytes < 0
            )
              errs.push(
                `${where}: "${p}.bytes" must be a non-negative finite number`
              );
            if (!isNonEmptyString(s.basis))
              errs.push(`${where}: "${p}.basis" must be a non-empty string`);
          });
      }
      if (sub.environment !== undefined) {
        if (!Array.isArray(sub.environment))
          errs.push(`${where}: "${path}.environment" must be an array`);
        else
          (sub.environment as unknown[]).forEach((e: unknown, i: number) => {
            const p = `${path}.environment[${i}]`;
            if (!isRecord(e)) {
              errs.push(`${where}: "${p}" must be an object`);
              return;
            }
            keys(errs, where, `${p}.`, e, [
              "name",
              "description",
              "required",
              "secret",
            ]);
            if (!isNonEmptyString(e.name))
              errs.push(`${where}: "${p}.name" must be a non-empty string`);
            if (!isNonEmptyString(e.description))
              errs.push(
                `${where}: "${p}.description" must be a non-empty string`
              );
            for (const k of ["required", "secret"])
              if (e[k] !== undefined && typeof e[k] !== "boolean")
                errs.push(`${where}: "${p}.${k}" must be a boolean`);
          });
      }
      break;
    }
    case "servers": {
      keys(errs, where, `${path}.`, sub, [
        "transport",
        "hosting",
        "clients",
        "authentication",
        "tools",
        "resources",
        "prompts",
      ]);
      textOpt(errs, where, path, sub, "transport");
      textOpt(errs, where, path, sub, "hosting");
      if (sub.clients !== undefined) {
        if (!Array.isArray(sub.clients))
          errs.push(`${where}: "${path}.clients" must be an array`);
        else
          (sub.clients as unknown[]).forEach((c: unknown, i: number) => {
            const p = `${path}.clients[${i}]`;
            if (!isRecord(c)) {
              errs.push(`${where}: "${p}" must be an object`);
              return;
            }
            keys(errs, where, `${p}.`, c, ["kind", "name", "versions"]);
            for (const k of ["kind", "name"])
              if (!isNonEmptyString(c[k]))
                errs.push(`${where}: "${p}.${k}" must be a non-empty string`);
            if (c.versions !== undefined && !isNonEmptyString(c.versions))
              errs.push(`${where}: "${p}.versions" must be a non-empty string`);
          });
      }
      if (sub.authentication !== undefined) {
        if (!isRecord(sub.authentication))
          errs.push(`${where}: "${path}.authentication" must be an object`);
        else {
          keys(errs, where, `${path}.authentication.`, sub.authentication, [
            "methods",
            "scopes",
            "notes",
          ]);
          stringArrayOpt(
            errs,
            where,
            `${path}.authentication`,
            sub.authentication,
            "methods"
          );
          stringArrayOpt(
            errs,
            where,
            `${path}.authentication`,
            sub.authentication,
            "scopes"
          );
          textOpt(
            errs,
            where,
            `${path}.authentication`,
            sub.authentication,
            "notes"
          );
        }
      }
      if (sub.tools !== undefined) {
        if (!Array.isArray(sub.tools))
          errs.push(`${where}: "${path}.tools" must be an array`);
        else
          (sub.tools as unknown[]).forEach((t: unknown, i: number) => {
            const p = `${path}.tools[${i}]`;
            if (!isRecord(t)) {
              errs.push(`${where}: "${p}" must be an object`);
              return;
            }
            keys(errs, where, `${p}.`, t, ["name", "description", "effect"]);
            if (!isNonEmptyString(t.name))
              errs.push(`${where}: "${p}.name" must be a non-empty string`);
            if (!isNonEmptyString(t.description))
              errs.push(
                `${where}: "${p}.description" must be a non-empty string`
              );
            if (
              t.effect !== undefined &&
              t.effect !== "read" &&
              t.effect !== "write" &&
              t.effect !== "destructive" &&
              t.effect !== "unknown"
            )
              errs.push(`${where}: "${p}.effect" has an unknown value`);
          });
      }
      for (const k of ["resources", "prompts"]) {
        if (sub[k] !== undefined) {
          if (!Array.isArray(sub[k]))
            errs.push(`${where}: "${path}.${k}" must be an array`);
          else
            (sub[k] as unknown[]).forEach((r: unknown, i: number) => {
              const p = `${path}.${k}[${i}]`;
              if (!isRecord(r)) {
                errs.push(`${where}: "${p}" must be an object`);
                return;
              }
              keys(errs, where, `${p}.`, r, ["name", "description"]);
              if (!isNonEmptyString(r.name))
                errs.push(`${where}: "${p}.name" must be a non-empty string`);
              if (!isNonEmptyString(r.description))
                errs.push(
                  `${where}: "${p}.description" must be a non-empty string`
                );
            });
        }
      }
      break;
    }
    case "models": {
      keys(errs, where, `${path}.`, sub, [
        "provider",
        "version",
        "availability",
        "licenseRestrictions",
        "toolCalling",
        "structuredOutput",
        "accessOptions",
        "hardwareRequirements",
        "rateLimits",
      ]);
      for (const k of [
        "provider",
        "version",
        "availability",
        "licenseRestrictions",
        "hardwareRequirements",
        "rateLimits",
      ])
        textOpt(errs, where, path, sub, k);
      for (const k of ["toolCalling", "structuredOutput"])
        if (sub[k] !== undefined && typeof sub[k] !== "boolean")
          errs.push(`${where}: "${path}.${k}" must be a boolean`);
      if (sub.accessOptions !== undefined) {
        if (!Array.isArray(sub.accessOptions))
          errs.push(`${where}: "${path}.accessOptions" must be an array`);
        else
          (sub.accessOptions as unknown[]).forEach((o: unknown, i: number) => {
            const p = `${path}.accessOptions[${i}]`;
            if (!isRecord(o)) {
              errs.push(`${where}: "${p}" must be an object`);
              return;
            }
            keys(errs, where, `${p}.`, o, ["label", "url"]);
            if (!isNonEmptyString(o.label))
              errs.push(`${where}: "${p}.label" must be a non-empty string`);
            if (!isHttpUrl(o.url))
              errs.push(`${where}: "${p}.url" must start with http(s)`);
          });
      }
      break;
    }
    case "tools": {
      keys(errs, where, `${path}.`, sub, [
        "integrations",
        "importFormats",
        "exportFormats",
        "offlineSupport",
        "accountRequired",
        "offlineLimitations",
        "accessibility",
        "cancellationUrl",
      ]);
      for (const k of ["integrations", "importFormats", "exportFormats"])
        stringArrayOpt(errs, where, path, sub, k);
      for (const k of ["offlineSupport", "accountRequired"])
        if (sub[k] !== undefined && typeof sub[k] !== "boolean")
          errs.push(`${where}: "${path}.${k}" must be a boolean`);
      for (const k of ["offlineLimitations", "accessibility"])
        textOpt(errs, where, path, sub, k);
      if (sub.cancellationUrl !== undefined && !isHttpUrl(sub.cancellationUrl))
        errs.push(
          `${where}: "${path}.cancellationUrl" must start with http(s)`
        );
      break;
    }
  }
  return errs;
}

// Curated metadata the collectors must never destroy. Used by the real
// write paths in collector/collect.mjs (dedup merge and --overwrite).
export function restoreCuratedFields<T>(merged: T, existing: unknown): T {
  if (!isRecord(merged) || !isRecord(existing)) return merged;
  const out = { ...(merged as Record<string, unknown>) };
  for (const k of ["details", "categoryDetails", "evidence"]) {
    if (k in existing) out[k] = existing[k];
  }
  return out as T;
}

// Every addressable path in an entry, including indexed array rows
// (details.cost.plans[0]). Evidence field references must name one.
export function collectEntryPaths(entry: unknown): Set<string> {
  const paths = new Set<string>();
  const walk = (v: unknown, p: string): void => {
    if (p) paths.add(p);
    if (Array.isArray(v)) v.forEach((item, i) => walk(item, `${p}[${i}]`));
    else if (isRecord(v))
      for (const [k, child] of Object.keys(v).map((k) => [k, v[k]] as const))
        walk(child, p ? `${p}.${k}` : k);
  };
  walk(entry, "");
  return paths;
}

export function validateEvidence(
  where: string,
  value: unknown,
  entry?: unknown
): string[] {
  const errs: string[] = [];
  if (!isRecord(value)) return [`${where}: "evidence" must be an object`];
  const paths = entry === undefined ? null : collectEntryPaths(entry);
  keys(errs, where, "evidence.", value, [
    "facts",
    "verification",
    "security",
    "benchmarks",
  ]);
  if (value.facts !== undefined) {
    if (!Array.isArray(value.facts))
      errs.push(`${where}: "evidence.facts" must be an array`);
    else
      value.facts.forEach((f: unknown, i: number) => {
        const p = `evidence.facts[${i}]`;
        if (!isRecord(f)) {
          errs.push(`${where}: "${p}" must be an object`);
          return;
        }
        keys(errs, where, `${p}.`, f, [
          "field",
          "sourceUrl",
          "observedAt",
          "attribution",
          "version",
        ]);
        if (!isNonEmptyString(f.field))
          errs.push(`${where}: "${p}.field" must be a non-empty string`);
        else if (paths !== null && !paths.has(f.field as string))
          errs.push(`${where}: "${p}.field" names no path in this entry`);
        if (!isHttpUrl(f.sourceUrl))
          errs.push(`${where}: "${p}.sourceUrl" must start with http(s)`);
        if (!isISODate(f.observedAt))
          errs.push(`${where}: "${p}.observedAt" must be an ISO date`);
        else if (isFutureDate(f.observedAt))
          errs.push(`${where}: "${p}.observedAt" must not be in the future`);
        if (
          f.attribution !== "publisher" &&
          f.attribution !== "third-party" &&
          f.attribution !== "directory"
        )
          errs.push(`${where}: "${p}.attribution" has an unknown value`);
        if (f.version !== undefined && !isNonEmptyString(f.version))
          errs.push(`${where}: "${p}.version" must be a non-empty string`);
      });
  }
  if (value.verification !== undefined) {
    const v = value.verification;
    if (!isRecord(v))
      errs.push(`${where}: "evidence.verification" must be an object`);
    else {
      keys(errs, where, "evidence.verification.", v, [
        "checkedAt",
        "fields",
        "method",
      ]);
      if (!isISODate(v.checkedAt))
        errs.push(
          `${where}: "evidence.verification.checkedAt" must be an ISO date`
        );
      else if (isFutureDate(v.checkedAt))
        errs.push(
          `${where}: "evidence.verification.checkedAt" must not be in the future`
        );
      if (!Array.isArray(v.fields) || v.fields.length === 0)
        errs.push(
          `${where}: "evidence.verification.fields" must be a non-empty array`
        );
      else
        (v.fields as unknown[]).forEach((f: unknown, i: number) => {
          if (!isNonEmptyString(f))
            errs.push(
              `${where}: "evidence.verification.fields[${i}]" must be a non-empty string`
            );
          else if (paths !== null && !paths.has(f as string))
            errs.push(
              `${where}: "evidence.verification.fields[${i}]" names no path in this entry`
            );
        });
      if (!isNonEmptyString(v.method))
        errs.push(
          `${where}: "evidence.verification.method" must be a non-empty string`
        );
    }
  }
  if (value.security !== undefined) {
    if (!Array.isArray(value.security))
      errs.push(`${where}: "evidence.security" must be an array`);
    else
      value.security.forEach((s: unknown, i: number) => {
        const p = `evidence.security[${i}]`;
        if (!isRecord(s)) {
          errs.push(`${where}: "${p}" must be an object`);
          return;
        }
        keys(errs, where, `${p}.`, s, [
          "type",
          "sourceUrl",
          "checkedAt",
          "target",
          "result",
          "counts",
        ]);
        if (s.type !== "sbom" && s.type !== "signature" && s.type !== "scan")
          errs.push(`${where}: "${p}.type" has an unknown value`);
        if (!isHttpUrl(s.sourceUrl))
          errs.push(`${where}: "${p}.sourceUrl" must start with http(s)`);
        if (!isISODate(s.checkedAt))
          errs.push(`${where}: "${p}.checkedAt" must be an ISO date`);
        else if (isFutureDate(s.checkedAt))
          errs.push(`${where}: "${p}.checkedAt" must not be in the future`);
        if (!isNonEmptyString(s.target))
          errs.push(`${where}: "${p}.target" must be a non-empty string`);
        if (!isNonEmptyString(s.result))
          errs.push(`${where}: "${p}.result" must be a non-empty string`);
        if (s.counts !== undefined) {
          if (!isRecord(s.counts))
            errs.push(`${where}: "${p}.counts" must be an object`);
          else
            for (const [k, n] of Object.entries(s.counts)) {
              if (typeof n !== "number" || !Number.isInteger(n) || n < 0)
                errs.push(
                  `${where}: "${p}.counts.${k}" must be a non-negative integer`
                );
            }
        }
      });
  }
  if (value.benchmarks !== undefined) {
    if (!Array.isArray(value.benchmarks))
      errs.push(`${where}: "evidence.benchmarks" must be an array`);
    else
      value.benchmarks.forEach((b: unknown, i: number) => {
        const p = `evidence.benchmarks[${i}]`;
        if (!isRecord(b)) {
          errs.push(`${where}: "${p}" must be an object`);
          return;
        }
        keys(errs, where, `${p}.`, b, [
          "metric",
          "value",
          "scale",
          "sourceUrl",
          "measuredAt",
          "target",
          "methodologyUrl",
          "configuration",
        ]);
        for (const k of ["metric", "scale", "target"])
          if (!isNonEmptyString(b[k]))
            errs.push(`${where}: "${p}.${k}" must be a non-empty string`);
        if (typeof b.value !== "number" || !Number.isFinite(b.value))
          errs.push(`${where}: "${p}.value" must be a finite number`);
        if (!isHttpUrl(b.sourceUrl))
          errs.push(`${where}: "${p}.sourceUrl" must start with http(s)`);
        if (!isISODate(b.measuredAt))
          errs.push(`${where}: "${p}.measuredAt" must be an ISO date`);
        else if (isFutureDate(b.measuredAt))
          errs.push(`${where}: "${p}.measuredAt" must not be in the future`);
        if (!isHttpUrl(b.methodologyUrl))
          errs.push(`${where}: "${p}.methodologyUrl" must start with http(s)`);
        if (b.configuration !== undefined && !isNonEmptyString(b.configuration))
          errs.push(
            `${where}: "${p}.configuration" must be a non-empty string`
          );
      });
  }
  return errs;
}
