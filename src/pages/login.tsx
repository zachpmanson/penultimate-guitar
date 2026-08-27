import useUser from "@/hooks/useUser";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

// /login is edge-gated by Caddy for HTTP Basic auth. Reaching this page means
// the browser sent valid credentials (Caddy 401'd the navigation and the
// browser presented its native prompt on success), so the user is already
// signed in — send them back to where they were. Keep it a plain <a>/full-page
// nav from the header so the Basic-auth dialog actually appears on the 401.
export default function Login() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      // Still anonymous: a full-page reload of /login is what makes Caddy issue
      // the credential prompt, so hard-navigate rather than client-side push.
      window.location.href = "/login";
      return;
    }
    const { origin } = window.location;
    const referrer = document.referrer;
    // Avoid a self-loop: after the sign-in reload the previous document is
    // still /login, so document.referrer is /login and blindly redirecting
    // there would cycle forever. Only honour a referrer that is a *different*
    // page; otherwise land on the home page.
    let target = "/";
    if (referrer && referrer.startsWith(origin)) {
      try {
        const refPath = new URL(referrer).pathname;
        if (refPath && refPath !== "/login") {
          target = refPath;
        }
      } catch {
        // fall through to "/"
      }
    }
    router.replace(target);
  }, [user, isLoading, router]);

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <div className="max-w-lg mx-auto my-4 flex flex-col gap-4">
        <p>Signing you in…</p>
      </div>
    </>
  );
}