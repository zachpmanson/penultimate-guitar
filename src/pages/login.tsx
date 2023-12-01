import SpotifyButton from "@/components/buttons/spotifybutton";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Login() {
  const session = useSession();
  const router = useRouter();

  if (session.status === "authenticated") {
    router.push("/profile");
  }

  return (
    <div className="max-w-lg mx-auto my-4">
      <div className="flex justify-center">
        <SpotifyButton
          onClick={() => signIn("spotify")}
          disabled={session.status === "loading"}
        >
          Sign in with Spotify
        </SpotifyButton>
      </div>
    </div>
  );
}
