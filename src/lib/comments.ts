import { getDb } from "./db.ts";

// PGlite-backed storage for @fuma-comment/server. Tables live in src/lib/db.ts
// (comments, rates, roles). Author/moderation columns are added on first use.
async function ensureColumns(): Promise<void> {
  const db = await getDb();
  await db.exec(`
    ALTER TABLE comments ADD COLUMN IF NOT EXISTS author_name VARCHAR(256);
    ALTER TABLE comments ADD COLUMN IF NOT EXISTS author_image VARCHAR(512);
    ALTER TABLE comments ADD COLUMN IF NOT EXISTS flagged BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE comments ADD COLUMN IF NOT EXISTS reports INTEGER NOT NULL DEFAULT 0;
  `);
}

const BANNED =
  /\b(viagra|cialis|casino|porn|xxx|bitcoin doubler|double your crypto|free money fast)\b/i;
const LINK_PATTERN =
  /https?:\/\/|www\.|\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|io|dev|org|net|app|ai|co|xyz|site|online|me|so|to)\b/i;

export function moderate(text: string): { flagged: boolean; reason?: string } {
  if (text.length > 500) return { flagged: true, reason: "too long" };
  if (LINK_PATTERN.test(text))
    return { flagged: true, reason: "link held for review" };
  if (BANNED.test(text)) return { flagged: true, reason: "banned pattern" };
  const letters = text.replace(/[^a-zA-Z]/g, "");
  if (
    letters.length > 50 &&
    letters.replace(/[^A-Z]/g, "").length / letters.length > 0.7
  ) {
    return { flagged: true, reason: "shouting" };
  }
  return { flagged: false };
}

export function textOf(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map(textOf).join(" ");
  if (content && typeof content === "object") {
    const c = content as Record<string, unknown>;
    return [c.text, c.content].filter(Boolean).map(textOf).join(" ");
  }
  return "";
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

// Auth seam: anonymous-first. The API wrapper sets a stable `tir_anon`
// cookie; getSession reads it. Bosbase sign-in stays as the upgrade path.
function anonIdFrom(req: {
  headers: Map<string, string | readonly string[]>;
}): string | null {
  const raw = req.headers.get("cookie");
  const cookie = Array.isArray(raw) ? raw.join(";") : raw || "";
  const m = cookie.match(/(?:^|;\s*)tir_anon=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export const commentsAuth = {
  getSession: (req: { headers: Map<string, string | readonly string[]> }) => {
    const id = anonIdFrom(req);
    return id ? { id } : null;
  },
  getSessionWithRole: () => null,
};

export const commentsStorage = {
  async report(id: number): Promise<{ reports: number; flagged: boolean }> {
    await ensureColumns();
    const db = await getDb();
    const res = await db.query<{ reports: number; flagged: boolean }>(
      `UPDATE comments SET reports = reports + 1, flagged = (reports + 1) >= 3 OR flagged
       WHERE id = $1 RETURNING reports, flagged`,
      [id]
    );
    if (!res.rows[0]) throw new Error("not found");
    return res.rows[0];
  },

  async getComments(options: {
    page: string;
    limit: number;
    after?: Date;
    auth?: { id: string };
  }) {
    await ensureColumns();
    const db = await getDb();
    const res = await db.query<Row>(
      `SELECT * FROM comments WHERE page = $1 AND NOT flagged ORDER BY timestamp DESC LIMIT $2`,
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
    await ensureColumns();
    const db = await getDb();
    const text = textOf(options.body.content);
    let mod = moderate(text);
    if (!mod.flagged) {
      const dup = await db.query<{ n: string }>(
        `SELECT count(*) AS n FROM comments WHERE page = $1 AND author = $2 AND content = $3 AND timestamp > now() - interval '24 hours'`,
        [options.page, options.auth.id, JSON.stringify(options.body.content)]
      );
      if (Number(dup.rows[0].n) > 0)
        mod = { flagged: true, reason: "duplicate" };
    }
    if (mod.flagged)
      console.warn(`comment held (${mod.reason}) on ${options.page}`);
    const shortName = options.auth.id.replace(/^anon-/, "").slice(0, 8);
    const res = await db.query<Row>(
      `INSERT INTO comments (page, thread, author, author_name, author_image, content, flagged)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        options.page,
        options.body.thread ? Number(options.body.thread) : null,
        options.auth.id,
        `anon-${shortName}`,
        `/api/avatar/${options.auth.id}.svg`,
        JSON.stringify(options.body.content),
        mod.flagged,
      ]
    );
    return toComment(res.rows[0]);
  },

  async updateComment(options: { id: string; body: { content: unknown } }) {
    const db = await getDb();
    const mod = moderate(textOf(options.body.content));
    await db.query(
      `UPDATE comments SET content = $1, flagged = flagged OR $2 WHERE id = $3`,
      [JSON.stringify(options.body.content), mod.flagged, Number(options.id)]
    );
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
