import prisma from "@/server/prisma";
import { getUserFromHeaders } from "@/server/auth";
import { getOrCreateAccountByUsername } from "@/server/account";
import { exchangeCodeForToken, getSpotifyMe } from "@/server/spotify-interface/spotify-auth";
import type { NextApiRequest, NextApiResponse } from "next";

// Completes the Connect-Spotify exchange. The browser POSTs the authorization
// code + PKCE verifier (both from the client-held flow). We exchange it for a
// long-lived refresh token and link the resulting Spotify identity onto the
// authenticated basic account (User.spotifyUserId + refresh token).
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method not allowed" });
    return;
  }
  const user = getUserFromHeaders(req.headers);
  if (!user) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const { code, code_verifier, redirect_uri } = req.body ?? {};
  if (typeof code !== "string" || typeof code_verifier !== "string" || typeof redirect_uri !== "string") {
    res.status(400).json({ error: "code, code_verifier, redirect_uri are required" });
    return;
  }

  try {
    const token = await exchangeCodeForToken({ code, redirectUri: redirect_uri, codeVerifier: code_verifier });
    const me = await getSpotifyMe(token.access_token);
    const account = await getOrCreateAccountByUsername(user);
    await prisma.user.update({
      where: { id: account.id },
      data: {
        spotifyUserId: me.id,
        spotifyRefreshToken: token.refresh_token,
      },
    });
    res.status(200).json({ ok: true, spotifyUserId: me.id });
  } catch (e) {
    console.error("Spotify connect failed", e);
    res.status(500).json({ error: "spotify connect failed" });
  }
}