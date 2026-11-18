import type { APIRoute } from "astro";
import { Hono } from "hono";
import { HonoComment } from "@fuma-comment/server/hono";
import { commentsAuth, commentsStorage } from "../../../lib/comments";

export const prerender = false;

let app: Hono | null = null;

function getApp(): Hono {
  if (!app) {
    app = new Hono();
    HonoComment({
      app,
      baseUrl: "/api/comments",
      role: "none",
      auth: commentsAuth,
      storage: commentsStorage,
    });
  }
  return app;
}

const handler: APIRoute = async ({ request }) => {
  const res = await getApp().fetch(request);
  return new Response(res.body, res);
};
export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;
