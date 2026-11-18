import { WorkOS } from "@workos-inc/node";

const COOKIE = "tir_session";

function client() {
  const apiKey = process.env.WORKOS_API_KEY;
  const clientId = process.env.WORKOS_CLIENT_ID;
  if (!apiKey || !clientId) return null;
  return { workos: new WorkOS(apiKey, { clientId }), clientId };
}

export function authConfigured(): boolean {
  return client() !== null;
}

function originOf(request: Request): string {
  return process.env.APP_URL || new URL(request.url).origin;
}

export function signInUrl(request: Request): string | null {
  const c = client();
  if (!c) return null;
  return c.workos.userManagement.getAuthorizationUrl({
    provider: "authkit",
    clientId: c.clientId,
    redirectUri: `${originOf(request)}/auth/callback`,
  });
}

export async function sessionFromCode(request: Request, code: string) {
  const c = client();
  if (!c) throw new Error("WorkOS is not configured");
  const password = process.env.WORKOS_COOKIE_PASSWORD;
  if (!password) throw new Error("WORKOS_COOKIE_PASSWORD is not set");
  const auth = await c.workos.userManagement.authenticateWithCode({
    clientId: c.clientId,
    code,
    session: { sealSession: true, cookiePassword: password },
  });
  return { sealed: auth.sealedSession as string, user: auth.user };
}

export function sessionCookie(sealed: string): string {
  return `${COOKIE}=${sealed}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`;
}

export function clearSessionCookie(): string {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export async function userFromRequest(request: Request) {
  const c = client();
  const password = process.env.WORKOS_COOKIE_PASSWORD;
  if (!c || !password) return null;
  const raw = request.headers.get("cookie") || "";
  const m = raw.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!m) return null;
  try {
    const session = c.workos.userManagement.loadSealedSession({
      sessionData: decodeURIComponent(m[1]),
      cookiePassword: password,
    });
    const auth = await session.authenticate();
    if (!auth.authenticated) return null;
    return auth.user;
  } catch {
    return null;
  }
}
