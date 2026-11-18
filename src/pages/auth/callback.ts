import type { APIRoute } from "astro";
import { sessionCookie, sessionFromCode } from "../../lib/auth";

export const prerender = false;

export const GET: APIRoute = async ({ request, url }) => {
  const code = url.searchParams.get("code");
  if (!code) return Response.redirect(new URL("/", url), 302);
  try {
    const { sealed } = await sessionFromCode(request, code);
    return new Response(null, {
      status: 302,
      headers: { location: "/", "set-cookie": sessionCookie(sealed) },
    });
  } catch {
    return Response.redirect(new URL("/?auth=failed", url), 302);
  }
};
