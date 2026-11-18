import type { APIRoute } from "astro";
import { signInUrl } from "../../lib/auth";

export const prerender = false;

export const GET: APIRoute = ({ request }) => {
  const url = signInUrl(request);
  if (!url) return new Response("WorkOS is not configured", { status: 503 });
  return Response.redirect(url, 302);
};
