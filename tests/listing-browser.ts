// Local-only browser fixture harness; start Astro on port 4329 first.
import { createServer } from "node:http";
import { readFileSync } from "node:fs";

const categories = [
  "skills",
  "agents",
  "containers",
  "servers",
  "models",
  "tools",
];
const server = createServer((request, response) => {
  const category =
    new URL(request.url || "/", "http://localhost").searchParams.get(
      "category"
    ) || "servers";
  if (!categories.includes(category)) {
    response.writeHead(404).end();
    return;
  }
  const entry = JSON.parse(
    readFileSync(
      new URL(`./fixtures/${category}.complete.json`, import.meta.url),
      "utf8"
    )
  );
  const props = {
    entry,
    category,
    name: entry.name,
    description: entry.description,
    url: entry.url,
    features: [],
    highlights: [],
    strengths: [],
    tradeoffs: [],
    pricing: [],
    builtWith: [],
    similar: [],
  };
  // Controlled test fixtures only, never a public listing or deployed route.
  const data = JSON.stringify(props).replaceAll("<", "\\u003c");
  const version = Date.now();
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  response.end(`<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Listing fixture: ${category}</title>
    <style>html{background:#020202;color:#d7efe0;font-family:system-ui}body{margin:0;padding:16px;max-width:1120px;margin-inline:auto}*{box-sizing:border-box}</style>
    <div id="root"></div><script type="module">
    import React from "http://127.0.0.1:4329/node_modules/.vite/deps/react.js?fixture=${version}";
    import ReactDOMClient from "http://127.0.0.1:4329/node_modules/.vite/deps/react-dom_client.js?fixture=${version}";
    import * as RefreshRuntime from "http://127.0.0.1:4329/@react-refresh";
    RefreshRuntime.injectIntoGlobalHook(window);
    window.$RefreshReg$ = () => {};
    window.$RefreshSig$ = () => (type) => type;
    const {default: Listing} = await import("http://127.0.0.1:4329/src/components/Listing.tsx");
    const params = new URLSearchParams(location.search);
    if (params.has("clipboard-failure")) Object.defineProperty(navigator, "clipboard", {value:{writeText:async()=>{throw new Error("Clipboard denied")}}});
    ReactDOMClient.createRoot(document.getElementById("root")).render(React.createElement(Listing, ${data}));
    </script></html>`);
});
server.listen(4330, "127.0.0.1", () =>
  console.log(
    "Listing fixture harness: http://127.0.0.1:4330/?category=servers"
  )
);
