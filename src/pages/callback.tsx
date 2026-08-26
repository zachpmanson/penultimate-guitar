import { completeConnectSpotify } from "@/utils/spotify";
import { useRouter } from "next/router";
import { useEffect } from "react";

// Landing page for the Spotify OAuth authorization redirect (redirect_uri).
// Reads code + state from the URL, finishes the exchange against our own
// /api/spotify/callback (using the PKCE verifier held in localStorage), then
// returns the user to /profile.
export default function SpotifyCallback() {
  const router = useRouter();

  useEffect(() => {
    const { code, state, error } = router.query;
    if (typeof window === "undefined") return;
    if (error) {
      router.replace("/profile");
      return;
    }
    if (typeof code !== "string" || typeof state !== "string") {
      router.replace("/profile");
      return;
    }
    const redirectUri = `${window.location.origin}/callback`;
    completeConnectSpotify(code, state, redirectUri)
      .then(() => router.replace("/profile"))
      .catch((e) => {
        console.error(e);
        router.replace("/profile");
      });
  }, [router]);

  return <div className="max-w-lg mx-auto my-4">Connecting Spotify…</div>;
}