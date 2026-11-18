import type { APIRoute } from "astro";

export const prerender = false;

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PALETTE = [
  "#04471c",
  "#04471c",
  "#058c42",
  "#058c42",
  "#16db65",
  "#16db65",
  "#d7efe0",
];
const CELL = 20;

export const GET: APIRoute = ({ params }) => {
  const rand = mulberry32(hashSeed(params.seed || "anon"));
  const cells: string[] = [];
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 3; x++) {
      const r = rand();
      const fill =
        r < 0.12 ? "#c9ef79" : PALETTE[Math.floor(rand() * PALETTE.length)];
      // Mirrored brick pair, occasional gap like the logo motif.
      if (r >= 0.92) continue;
      const x1 = x * CELL;
      const x2 = (4 - x) * CELL;
      const rect = (px: number) =>
        `<rect x="${px}" y="${y * CELL}" width="${CELL - 3}" height="${CELL - 3}" rx="2" fill="${fill}"/>`;
      cells.push(rect(x1) + (x1 === x2 ? "" : rect(x2)));
    }
  }
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">` +
    `<rect width="100" height="100" rx="20" fill="#0d2818"/>` +
    cells.join("") +
    `</svg>`;
  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
};
