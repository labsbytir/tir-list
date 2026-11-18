import type { APIRoute } from "astro";
import { commentsStorage } from "../../../lib/comments";

export const prerender = false;

const json = (data: unknown, status: number) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });

export const POST: APIRoute = async ({ request }) => {
  let id: number;
  try {
    id = Number((await request.json()).id);
  } catch {
    return json({ message: "expected { id }" }, 400);
  }
  if (!Number.isInteger(id)) return json({ message: "expected { id }" }, 400);
  try {
    return json(await commentsStorage.report(id), 200);
  } catch {
    return json({ message: "not found" }, 404);
  }
};
