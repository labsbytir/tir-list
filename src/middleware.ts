import type { MiddlewareHandler } from "astro";

export const onRequest: MiddlewareHandler = async (context, next) => {
  const response = await next();
  if (context.request.method !== "GET") return response;
  const headers = new Headers(response.headers);
  if (headers.has("cache-control")) return response;
  const url = new URL(context.request.url);
  if (url.pathname.startsWith("/_server-islands/")) {
    headers.set(
      "cache-control",
      "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400"
    );
  } else if ((headers.get("content-type") || "").includes("text/html")) {
    headers.set(
      "cache-control",
      "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400"
    );
  } else {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
