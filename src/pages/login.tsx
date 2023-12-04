import SpotifyButton from "@/components/buttons/spotifybutton";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Login() {
  const session = useSession();
  const router = useRouter();

  if (session.status === "authenticated") {
    router.push("/profile");
  }

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <div className="max-w-lg mx-auto my-4 flex flex-col gap-4">
        <p>
          You don&apos;t need to log in to save songs or import playlists, but
          you will need log in to sync saved songs across multiple devices.
        </p>
        <p>
          This is in ALPHA. Currently Spotify login is only available for
          certain accounts.
        </p>
        <div className="flex justify-center">
          <SpotifyButton
            onClick={() => signIn("spotify")}
            disabled={session.status === "loading"}
          >
            Sign in with Spotify
          </SpotifyButton>
        </div>
      </div>
    </>
  );
}
