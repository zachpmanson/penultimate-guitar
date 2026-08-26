import { getUserFromHeaders } from "@/server/auth";
import { buildAuthorizeUrl } from "@/server/spotify-interface/spotify-auth";
import type { NextApiRequest, NextApiResponse } from "next";

// Starts the Connect-Spotify flow. Requires an authenticated edge identity
// (you must be signed into your basic account before linking Spotify). PKCE
// material is generated client-side and passed in, so no server session/secret
// is stored. Returns the Spotify authorization URL to redirect the browser to.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "method not allowed" });
    return;
  }
  const user = getUserFromHeaders(req.headers);
  if (!user) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const { state, code_challenge } = req.query;
  if (typeof state !== "string" || typeof code_challenge !== "string") {
    res.status(400).json({ error: "state and code_challenge are required" });
    return;
  }

  const host = req.headers.host;
  const proto = req.headers["x-forwarded-proto"] ?? "https";
  const origin = host ? `${proto}://${host}` : "";
  const redirectUri = `${origin}/callback`;

  res.status(200).json({
    url: buildAuthorizeUrl({ state, codeChallenge: code_challenge, redirectUri }),
  });
}