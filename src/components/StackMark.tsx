const files: Record<string, string> = {
  React: "reactjs",
  "Next.js": "nextjs",
  Astro: "astro",
  Python: "python",
  Go: "go",
  Rust: "rust-light",
  TypeScript: "typescript",
  JavaScript: "javascript",
  Postgres: "postgresql",
  Redis: "redis",
  Django: "django",
  FastAPI: "fast-api",
  Elasticsearch: "elastic",
  "Node.js": "nodejs",
};

const base = "https://cdn.jsdelivr.net/gh/xandemon/developer-icons@7.1.0/icons/";

export default function StackMark({ name }: { name: string }) {
  const file = files[name];
  if (!file) return null;
  return <img src={`${base}${file}.svg`} alt="" width={22} height={22} />;
}
