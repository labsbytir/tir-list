import type { APIRoute } from "astro";
import { clearSessionCookie } from "../../lib/auth";

export const prerender = false;

export const GET: APIRoute = ({ url }) =>
  new Response(null, {
    status: 302,
    headers: { location: "/", "set-cookie": clearSessionCookie() },
  });
