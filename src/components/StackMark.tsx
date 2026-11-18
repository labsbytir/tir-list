import {
  _React,
  Nextjs,
  _Astro,
  Python,
  Go,
  Rust,
  Typescript,
  Javascript,
  Postgresql,
  Sqlite,
  Redis,
  Nginx,
  Django,
  Fastapi,
  Elasticsearch,
  Nodejs,
} from "@dev.icons/react";

const marks: Record<string, typeof Python> = {
  React: _React,
  "Next.js": Nextjs,
  Astro: _Astro,
  Python,
  Go,
  Rust,
  TypeScript: Typescript,
  JavaScript: Javascript,
  Postgres: Postgresql,
  SQLite: Sqlite,
  Redis,
  nginx: Nginx,
  Django,
  FastAPI: Fastapi,
  Elasticsearch,
  "Node.js": Nodejs,
};

export default function StackMark({ name }: { name: string }) {
  const Mark = marks[name];
  if (!Mark) return null;
  return <Mark size={22} alt={name} />;
}
