export interface RemoteListing {
  slug: string;
  category: string;
  name: string;
  description: string;
  url: string;
  tags: string[];
  links?: Record<string, string>;
}

export function bosbaseConfig(): { base: string; key: string | null } {
  return {
    base: process.env.BOSBASE_URL || "https://www.bosbase.com",
    key: process.env.BOSBASE_API_KEY || null,
  };
}

// Endpoint path is an assumption until the Bosbase API is confirmed:
// expected: POST {base}/api/listings with Bearer key, body { listings: [...] }.
export async function pushListings(entries: RemoteListing[]): Promise<void> {
  const { base, key } = bosbaseConfig();
  if (!key) {
    console.warn("BOSBASE_API_KEY not set, skipping Bosbase push.");
    return;
  }
  const res = await fetch(`${base}/api/listings`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ listings: entries }),
  });
  if (!res.ok)
    throw new Error(`Bosbase push failed: ${res.status} ${await res.text()}`);
  console.log(`pushed ${entries.length} listings to ${base}`);
}
