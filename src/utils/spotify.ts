// Client side of the Connect-Spotify flow (PKCE). The PKCE material lives here
// (localStorage) so the server keeps no session for linking. Redirect_uri is
// `/callback`, which must be registered in the Spotify app dashboard.

const STATE_KEY = "spotify-connect-state";
const VERIFIER_KEY = "spotify-connect-code-verifier";

function toB64url(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toB64url(bytes.buffer);
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(plain));
}

/** Kick off the Connect flow: store PKCE+state client-side, then send the user to Spotify. */
export async function startConnectSpotify(): Promise<void> {
  const codeVerifier = randomToken();
  const state = randomToken();
  const codeChallenge = toB64url(await sha256(codeVerifier));

  localStorage.setItem(VERIFIER_KEY, codeVerifier);
  localStorage.setItem(STATE_KEY, state);

  const res = await fetch(`/api/spotify/authorize?state=${encodeURIComponent(state)}&code_challenge=${encodeURIComponent(codeChallenge)}`);
  if (!res.ok) throw new Error("Could not start Spotify connect (are you signed in?)");
  const { url } = await res.json();
  window.location.assign(url);
}

/** Finish the connect after Spotify redirects to /callback. */
export async function completeConnectSpotify(code: string, returnedState: string, redirectUri: string): Promise<void> {
  const expectedState = localStorage.getItem(STATE_KEY);
  const codeVerifier = localStorage.getItem(VERIFIER_KEY);
  localStorage.removeItem(STATE_KEY);
  localStorage.removeItem(VERIFIER_KEY);

  if (!expectedState || !codeVerifier || returnedState !== expectedState) {
    throw new Error("Spotify connect failed: state mismatch or missing PKCE material.");
  }

  const res = await fetch("/api/spotify/callback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, code_verifier: codeVerifier, redirect_uri: redirectUri }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Spotify connect failed.");
  }
}