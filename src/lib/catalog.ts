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
  specs?: Record<string, string | number | null>;
  benchmarks?: Record<string, unknown> | null;
  usageHistory?: { date: string; tokens: number }[];
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
