import { PGlite } from "@electric-sql/pglite";
import { vector } from "@electric-sql/pglite-pgvector";

export interface Listing {
  slug: string;
  category: string;
  name: string;
  description: string;
  url: string;
  tags: string[];
}

let db: PGlite | null = null;

export async function getDb(): Promise<PGlite> {
  if (!db) {
    db = new PGlite(process.env.PGLITE_DIR || "./data/pglite", {
      extensions: { vector },
    });
    await db.exec("CREATE EXTENSION IF NOT EXISTS vector;");
    await db.exec(`
      CREATE TABLE IF NOT EXISTS listings (
        slug TEXT NOT NULL,
        category TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        url TEXT NOT NULL,
        tags JSONB NOT NULL DEFAULT '[]',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (category, slug)
      );
      CREATE TABLE IF NOT EXISTS roles (
        "userId" VARCHAR(256) PRIMARY KEY,
        name VARCHAR(256) NOT NULL,
        "canDelete" BOOLEAN NOT NULL
      );
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY NOT NULL,
        page VARCHAR(256) NOT NULL,
        thread INTEGER,
        author VARCHAR(256) NOT NULL,
        content JSONB NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT now() NOT NULL
      );
      CREATE TABLE IF NOT EXISTS rates (
        "userId" VARCHAR(256) NOT NULL,
        "commentId" INTEGER NOT NULL,
        "like" BOOLEAN NOT NULL,
        PRIMARY KEY ("userId", "commentId")
      );
      CREATE INDEX IF NOT EXISTS comment_idx ON rates ("commentId");
    `);
  }
  return db;
}

export async function upsertListing(entry: Listing): Promise<void> {
  const client = await getDb();
  await client.query(
    `INSERT INTO listings (slug, category, name, description, url, tags)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (category, slug) DO UPDATE SET
       name = EXCLUDED.name,
       description = EXCLUDED.description,
       url = EXCLUDED.url,
       tags = EXCLUDED.tags,
       updated_at = now()`,
    [
      entry.slug,
      entry.category,
      entry.name,
      entry.description,
      entry.url,
      JSON.stringify(entry.tags),
    ]
  );
}
