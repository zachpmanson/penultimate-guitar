import { NextRequest } from "next/server";

// Edge-trusted identity — the spells/bingo pattern.
//
// The ONLY ingress to this service is Caddy (the app binds a loopback port; see
// the nix module). Caddy terminates HTTP Basic auth and stamps every
// authenticated request with an `X-Auth-User` header naming the basicauth
// username, and strips any client-supplied value on anonymous requests. We
// never parse credentials or run our own session store — we trust that header
// for exactly as long as Caddy stays the sole writer of it.
//
// Consequence: there is no server-side login *event* or logout. Basic auth
// re-presents the credential on every request, so the browser's stored
// credentials are the session. A "sign in" is just navigating to /login (which
// Caddy hard-gates, surfacing the browser credential prompt); a "sign out" is
// the user clearing their browser's saved credentials for this host.

/** Name of the identity header Caddy stamps on authenticated requests. */
export const AUTH_HEADER = "x-auth-user";

/** Read the edge-authenticated identity (username) from a Node request. */
export function getUserFromHeaders(headers: Record<string, string | string[] | undefined>): string | null {
  const raw = headers[AUTH_HEADER];
  if (!raw) return null;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value?.trim() ? value : null;
}

/** Read the edge-authenticated identity from a Next 13+ request. */
export function getUserFromNextRequest(request: NextRequest | Request): string | null {
  return request.headers.get(AUTH_HEADER)?.trim() || null;
}