import type { APIRoute } from "astro";
import { categories } from "../../lib/catalog";

export const prerender = true;

export const GET: APIRoute = () => {
  return new Response(
    JSON.stringify({
      updated: new Date().toISOString(),
      categories: Object.fromEntries(categories.map((c) => [c.id, c.items])),
    }),
    { headers: { "content-type": "application/json" } }
  );
};
