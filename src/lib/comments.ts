import { getDb } from "./db.ts";

// PGlite-backed storage for @fuma-comment/server. Tables live in src/lib/db.ts
// (comments, rates, roles). Author display columns are added on first use.
async function ensureAuthorColumns(): Promise<void> {
  const db = await getDb();
  await db.exec(`
    ALTER TABLE comments ADD COLUMN IF NOT EXISTS author_name VARCHAR(256);
    ALTER TABLE comments ADD COLUMN IF NOT EXISTS author_image VARCHAR(512);
  `);
}

interface Row {
  id: number;
  page: string;
  thread: number | null;
  author: string;
  author_name: string | null;
  author_image: string | null;
  content: unknown;
  timestamp: string;
}

async function counts(
  commentId: number
): Promise<{ likes: number; dislikes: number; replies: number }> {
  const db = await getDb();
  const likes = await db.query<{ n: string }>(
    `SELECT count(*) AS n FROM rates WHERE "commentId" = $1 AND "like" = true`,
    [commentId]
  );
  const dislikes = await db.query<{ n: string }>(
    `SELECT count(*) AS n FROM rates WHERE "commentId" = $1 AND "like" = false`,
    [commentId]
  );
  const replies = await db.query<{ n: string }>(
    `SELECT count(*) AS n FROM comments WHERE thread = $1`,
    [commentId]
  );
  return {
    likes: Number(likes.rows[0].n),
    dislikes: Number(dislikes.rows[0].n),
    replies: Number(replies.rows[0].n),
  };
}

async function toComment(
  row: Row,
  liked?: boolean
): Promise<Record<string, unknown>> {
  const c = await counts(row.id);
  return {
    id: String(row.id),
    threadId: row.thread === null ? undefined : String(row.thread),
    page: row.page,
    author: {
      id: row.author,
      name: row.author_name || row.author,
      image: row.author_image || undefined,
    },
    content: row.content,
    likes: c.likes,
    dislikes: c.dislikes,
    replies: c.replies,
    timestamp: new Date(row.timestamp),
    ...(liked === undefined ? {} : { liked }),
  };
}

// Auth seam: Bosbase handles auth. Until its endpoint is confirmed,
// sessions resolve to null (read-only) and sign-in redirects to Bosbase.
export const commentsAuth = {
  getSession: () => null,
  getSessionWithRole: () => null,
};

export const commentsStorage = {
  async getComments(options: {
    page: string;
    limit: number;
    after?: Date;
    auth?: { id: string };
  }) {
    await ensureAuthorColumns();
    const db = await getDb();
    const res = await db.query<Row>(
      `SELECT * FROM comments WHERE page = $1 ORDER BY timestamp DESC LIMIT $2`,
      [options.page, options.limit]
    );
    const out = [];
    for (const row of res.rows) {
      let liked: boolean | undefined;
      if (options.auth?.id) {
        const r = await db.query<{ like: boolean }>(
          `SELECT "like" FROM rates WHERE "userId" = $1 AND "commentId" = $2`,
          [options.auth.id, row.id]
        );
        if (r.rows[0]) liked = r.rows[0].like;
      }
      out.push(await toComment(row, liked));
    }
    return out;
  },

  async postComment(options: {
    auth: { id: string };
    page: string;
    body: { content: unknown; thread?: string };
  }) {
    await ensureAuthorColumns();
    const db = await getDb();
    const res = await db.query<Row>(
      `INSERT INTO comments (page, thread, author, author_name, content)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        options.page,
        options.body.thread ? Number(options.body.thread) : null,
        options.auth.id,
        options.auth.id,
        JSON.stringify(options.body.content),
      ]
    );
    return toComment(res.rows[0]);
  },

  async updateComment(options: { id: string; body: { content: unknown } }) {
    const db = await getDb();
    await db.query(`UPDATE comments SET content = $1 WHERE id = $2`, [
      JSON.stringify(options.body.content),
      Number(options.id),
    ]);
  },

  async deleteComment(options: { id: string }) {
    const db = await getDb();
    await db.query(`DELETE FROM rates WHERE "commentId" = $1`, [
      Number(options.id),
    ]);
    await db.query(`DELETE FROM comments WHERE id = $1`, [Number(options.id)]);
  },

  async getCommentAuthor(options: { id: string }) {
    const db = await getDb();
    const res = await db.query<{ author: string }>(
      `SELECT author FROM comments WHERE id = $1`,
      [Number(options.id)]
    );
    return res.rows[0]?.author ?? null;
  },

  async setRate(options: {
    auth: { id: string };
    id: string;
    body: { like: boolean };
  }) {
    const db = await getDb();
    await db.query(
      `INSERT INTO rates ("userId", "commentId", "like") VALUES ($1, $2, $3)
       ON CONFLICT ("userId", "commentId") DO UPDATE SET "like" = EXCLUDED."like"`,
      [options.auth.id, Number(options.id), options.body.like]
    );
  },

  async deleteRate(options: { auth: { id: string }; id: string }) {
    const db = await getDb();
    await db.query(
      `DELETE FROM rates WHERE "userId" = $1 AND "commentId" = $2`,
      [options.auth.id, Number(options.id)]
    );
  },

  async getRole() {
    return null;
  },
};
