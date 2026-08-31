// Spotify account linking (Connect-Spotify), independent of edge identity.
//
// The edge identity is the account; Spotify is an optional credential linked
// onto it (User.spotifyUserId + User.spotifyRefreshToken). Linking uses OAuth
// 2.0 Authorization Code + PKCE. The user holds the PKCE code_verifier and
// state client-side (in localStorage), so no server-side session/secret is
// needed: the client redirects to Spotify, Spotify returns to a thin callback
// page, and that page POSTs { code, code_verifier, state } to
// /api/spotify/callback, which exchanges it and persists the refresh token on
// the authenticated User row.

const ACCOUNTS_HOST = "https://accounts.spotify.com";
const API_HOST = "https://api.spotify.com";

function clientCredentials(): string {
  return Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64");
}

/** Build the Spotify authorization URL for the Connect flow (PKCE). */
export function buildAuthorizeUrl(opts: { state: string; codeChallenge: string; redirectUri: string }) {
  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    response_type: "code",
    redirect_uri: opts.redirectUri,
    state: opts.state,
    scope: "playlist-read-private playlist-read-collaborative",
    code_challenge_method: "S256",
    code_challenge: opts.codeChallenge,
  });
  return `${ACCOUNTS_HOST}/authorize?${params.toString()}`;
}

export interface SpotifyTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}

/** Exchange the authorization code for an access + refresh token (PKCE). */
export async function exchangeCodeForToken(opts: {
  code: string;
  redirectUri: string;
  codeVerifier: string;
}): Promise<SpotifyTokenResponse & { refresh_token: string }> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: opts.code,
    redirect_uri: opts.redirectUri,
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    code_verifier: opts.codeVerifier,
  });
  return tokenRequest(body);
}

/** Mint a short-lived user access token from a stored refresh token. */
export async function refreshUserAccessToken(refreshToken: string): Promise<SpotifyTokenResponse> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: process.env.SPOTIFY_CLIENT_ID!,
  });
  return tokenRequest(body);
}

async function tokenRequest(body: URLSearchParams): Promise<any> {
  const res = await fetch(`${ACCOUNTS_HOST}/api/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${clientCredentials()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });
  if (!res.ok) {
    throw new Error(`Spotify token request failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

/** Fetch the current user's profile (id/name) for a user-scoped token. */
export async function getSpotifyMe(accessToken: string): Promise<{ id: string; display_name?: string }> {
  const res = await fetch(`${API_HOST}/v1/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Spotify /me failed: ${res.status}`);
  return res.json();
}