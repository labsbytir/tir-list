export interface ModelSpecs {
  contextLength?: number;
  pricingPrompt?: string;
  pricingCompletion?: string;
  modalities?: string;
  releasedAt?: string | null;
  knowledgeCutoff?: string | null;
  maxOutput?: number | null;
  moderated?: boolean | null;
  parameters?: string[];
  endpoints?: string[];
  reasoning?: {
    mandatory?: boolean;
    defaultEffort?: string | null;
    efforts?: string[];
  } | null;
}

export interface CompatibilityItem {
  kind: string;
  name: string;
  versions?: string;
}

export interface RequirementItem {
  kind: string;
  description: string;
}

export interface SetupInstruction {
  label: string;
  target: string;
  kind: "command" | "configuration" | "link";
  value: string;
  sourceUrl: string;
}

export interface SetupExample {
  input: string;
  output?: string;
  environment?: string;
}

export interface CostPlan {
  name: string;
  amount?: number;
  currency?: string;
  unit?: string;
  notes?: string;
  sourceUrl?: string;
}

export interface CostInfo {
  model?:
    | "free"
    | "freemium"
    | "subscription"
    | "usage-based"
    | "paid-once"
    | "contact-sales";
  plans?: CostPlan[];
  trial?: string;
  externalCosts?: string[];
}

export interface DataHandlingInfo {
  processing?: "local" | "cloud" | "hybrid";
  retention?: string;
  permissions?: string[];
  destinations?: string[];
  privacyUrl?: string;
}

export interface MaintainerInfo {
  name?: string;
  url?: string;
  status?: "active" | "maintenance-only" | "archived" | "discontinued";
}

export interface SupportChannel {
  label: string;
  url: string;
}

export interface SupportInfo {
  docsUrl?: string;
  channels?: SupportChannel[];
  tier?: string;
  responseCommitment?: string;
}

export interface MediaItem {
  kind: "screenshot" | "demo";
  url: string;
  alt?: string;
  caption?: string;
}

export interface AlternativeRef {
  category: string;
  slug: string;
  reason: string;
}

export interface ListingDetails {
  bestFor?: string[];
  notSuitedFor?: string[];
  compatibility?: CompatibilityItem[];
  requirements?: RequirementItem[];
  setup?: {
    difficulty?: "beginner" | "intermediate" | "advanced";
    estimatedMinutes?: number;
    steps?: string[];
    instructions?: SetupInstruction[];
    example?: SetupExample;
  };
  cost?: CostInfo;
  dataHandling?: DataHandlingInfo;
  maintainer?: MaintainerInfo;
  support?: SupportInfo;
  media?: MediaItem[];
  alternatives?: AlternativeRef[];
}

export interface SkillsDetails {
  format?: string;
  allowedTools?: string[];
}

export interface AgentsDetails {
  tasks?: string[];
  environments?: string[];
  triggers?: string[];
  modelRequirements?: string[];
  integrations?: string[];
  deploymentOptions?: string[];
  autonomy?: string;
  approvalControls?: string;
  memory?: string;
}

export interface ContainerSize {
  architecture: string;
  bytes: number;
  basis: string;
}

export interface ContainerEnvVar {
  name: string;
  description: string;
  required?: boolean;
  secret?: boolean;
}

export interface ContainersDetails {
  registry?: string;
  repository?: string;
  tag?: string;
  digest?: string;
  baseOs?: string;
  license?: string;
  versionPolicy?: string;
  updateCadence?: string;
  architectures?: string[];
  requiredPrivileges?: string[];
  rootless?: boolean;
  sizes?: ContainerSize[];
  ports?: string[];
  volumes?: string[];
  environment?: ContainerEnvVar[];
}

export interface McpToolCapability {
  name: string;
  description: string;
  effect?: "read" | "write" | "destructive" | "unknown";
}

export interface McpNamedCapability {
  name: string;
  description: string;
}

export interface ServersDetails {
  transport?: string;
  hosting?: string;
  clients?: CompatibilityItem[];
  authentication?: {
    methods?: string[];
    scopes?: string[];
    notes?: string;
  };
  tools?: McpToolCapability[];
  resources?: McpNamedCapability[];
  prompts?: McpNamedCapability[];
}

export interface ModelsDetails {
  provider?: string;
  version?: string;
  availability?: string;
  licenseRestrictions?: string;
  toolCalling?: boolean;
  structuredOutput?: boolean;
  accessOptions?: { label: string; url: string }[];
  hardwareRequirements?: string;
  rateLimits?: string;
}

export interface ToolsDetails {
  integrations?: string[];
  importFormats?: string[];
  exportFormats?: string[];
  offlineSupport?: boolean;
  accountRequired?: boolean;
  offlineLimitations?: string;
  accessibility?: string;
  cancellationUrl?: string;
}

export interface CategoryDetails {
  skills?: SkillsDetails;
  agents?: AgentsDetails;
  containers?: ContainersDetails;
  servers?: ServersDetails;
  models?: ModelsDetails;
  tools?: ToolsDetails;
}

export interface FactProvenance {
  field: string;
  sourceUrl: string;
  observedAt: string;
  attribution: "publisher" | "third-party" | "directory";
  version?: string;
}

export interface VerificationInfo {
  checkedAt: string;
  fields: string[];
  method: string;
}

export interface SecurityEvidence {
  type: "sbom" | "signature" | "scan";
  sourceUrl: string;
  checkedAt: string;
  target: string;
  result: string;
  counts?: Record<string, number>;
}

export interface BenchmarkEvidence {
  metric: string;
  value: number;
  scale: string;
  sourceUrl: string;
  measuredAt: string;
  target: string;
  methodologyUrl: string;
  configuration?: string;
}

export interface ListingEvidence {
  facts?: FactProvenance[];
  verification?: VerificationInfo;
  security?: SecurityEvidence[];
  benchmarks?: BenchmarkEvidence[];
}

export interface Entry {
  slug: string;
  name: string;
  description: string;
  url: string;
  tags: string[];
  links?: Record<string, string>;
  install?: { label: string; command: string };
  repo?: string;
  stats?: Record<string, string | number | null>;
  statsHistory?: { date: string; stars: number }[];
  releases?: {
    tag: string;
    name: string;
    publishedAt?: string;
    url: string;
    notes?: string;
  }[];
  changelog?: { source: string; url: string; excerpt: string } | null;
  activity?: { week: number; days: number[]; total: number }[];
  views?: {
    count: number;
    uniques: number;
    weeks?: { date: string; count: number; uniques: number }[];
  };
  permaslug?: string;
  specs?: ModelSpecs;
  benchmarks?: Record<string, unknown> | null;
  usageHistory?: { date: string; tokens: number }[];
  about?: string;
  features?: string[];
  highlights?: string[];
  pricing?: { plan: string; price: string }[];
  builtWith?: { kind: string; name: string }[];
  verdict?: {
    strengths: { text: string; open: number; closed: number }[];
    tradeoffs: { text: string; open: number; closed: number }[];
    sampled?: number;
  };
  sources?: { website?: string; pricing?: string };
  icon?: string;
  details?: ListingDetails;
  categoryDetails?: CategoryDetails;
  evidence?: ListingEvidence;
}

export interface Category {
  id: string;
  label: string;
  items: Entry[];
}

export const labels: Record<string, string> = {
  skills: "Skills",
  models: "Models",
  containers: "Containers",
  servers: "Servers",
  agents: "Agents",
  tools: "Tools",
};

const order = ["skills", "models", "containers", "servers", "agents", "tools"];

const modules = import.meta.glob("../../catalog/*/*.json", {
  eager: true,
}) as Record<string, { default: Entry }>;

const byCategory = new Map<string, Entry[]>();
for (const [path, mod] of Object.entries(modules)) {
  const id = path.split("/").slice(-2, -1)[0];
  if (!byCategory.has(id)) byCategory.set(id, []);
  byCategory.get(id)!.push(mod.default);
}
for (const items of byCategory.values()) {
  items.sort((a, b) => a.name.localeCompare(b.name));
}

export const categories: Category[] = order
  .filter((id) => byCategory.has(id))
  .map((id) => ({ id, label: labels[id], items: byCategory.get(id)! }));

export const allEntries = categories.flatMap((c) =>
  c.items.map((e) => ({ ...e, category: c.id }))
);

export function starsOf(e: Entry): number | null {
  return typeof e.stats?.stars === "number" ? e.stats.stars : null;
}

export function isKnownCategoryId(id: string): boolean {
  return id in labels;
}

// The single categoryDetails key valid for a listing in `category`.
export function categoryDetailsKey(category: string): string | null {
  return isKnownCategoryId(category) ? category : null;
}

export function velocityOf(e: Entry): number | null {
  const h = e.statsHistory;
  if (!h || h.length < 2) return null;
  const first = h[0];
  const last = h[h.length - 1];
  const days = Math.max(
    1,
    (Date.parse(last.date) - Date.parse(first.date)) / 86400000
  );
  return (last.stars - first.stars) / days;
}
