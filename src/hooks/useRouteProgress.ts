import { useRouter } from "next/router";
import "../styles/nprogress.css";
import { useEffect } from "react";
import NProgress from "nprogress";

export default function useRouteProgress() {
  const router = useRouter();

  useEffect(() => {
    const handleStart = (url: string) => {
      NProgress.start();
    };

    const handleStop = () => {
      NProgress.done();
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleStop);
    router.events.on("routeChangeError", handleStop);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleStop);
      router.events.off("routeChangeError", handleStop);
    };
  }, [router]);
}
