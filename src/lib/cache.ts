import Valkey from "iovalkey";

let client: InstanceType<typeof Valkey> | null = null;
let warned = false;

function getClient(): InstanceType<typeof Valkey> | null {
  if (process.env.VALKEY_URL === "off") return null;
  if (!client) {
    try {
      client = new Valkey(process.env.VALKEY_URL || "redis://127.0.0.1:6379", {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
      });
      client.on("error", () => {
        if (!warned) {
          warned = true;
          console.warn("valkey unavailable, caching disabled");
        }
      });
    } catch {
      return null;
    }
  }
  return client;
}

export async function cacheGet(key: string): Promise<string | null> {
  try {
    const c = getClient();
    if (!c) return null;
    return await c.get(key);
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: string, ttlSeconds: number): Promise<void> {
  try {
    const c = getClient();
    if (!c) return;
    await c.set(key, value, "EX", ttlSeconds);
  } catch {
    /* fail-open */
  }
}

export async function cacheInvalidatePrefix(prefix: string): Promise<void> {
  try {
    const c = getClient();
    if (!c) return;
    let cursor = "0";
    do {
      const [next, keys] = await c.scan(cursor, "MATCH", `${prefix}*`, "COUNT", 100);
      cursor = next;
      if (keys.length) await c.del(...keys);
    } while (cursor !== "0");
  } catch {
    /* fail-open */
  }
}

export async function cached<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
  const hit = await cacheGet(key);
  if (hit !== null) return JSON.parse(hit) as T;
  const value = await fn();
  await cacheSet(key, JSON.stringify(value), ttlSeconds);
  return value;
}
