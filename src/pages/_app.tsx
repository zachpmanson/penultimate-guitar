import Layout from "@/components/layout";
import GlobalProvider from "@/contexts/Global";
import "@/styles/globals.css";
import type { NextPage } from "next";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import NProgress from "nprogress";
import { ReactElement, ReactNode, useEffect } from "react";
import "../styles/nprogress.css";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) {
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
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);
  return getLayout(
    <GlobalProvider>
      <SessionProvider session={session}>
        <Layout>
          <Head>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            <meta
              name="description"
              content="Find the cheapest drinks, per standard"
            />
            <link
              rel="apple-touch-icon"
              sizes="180x180"
              href="/icons/apple-touch-icon.png"
            />
            <link
              rel="icon"
              type="image/png"
              sizes="32x32"
              href="/icons/favicon-32x32.png"
            />
            <link
              rel="icon"
              type="image/png"
              sizes="16x16"
              href="/icons/favicon-16x16.png"
            />
            <link rel="manifest" href="/icons/site.webmanifest" />
            <link
              rel="mask-icon"
              href="/icons/safari-saved-tab.svg"
              color="#bd93f9"
            />
            <link rel="shortcut icon" href="/icons/favicon.ico" />
            <meta name="msapplication-TileColor" content="#603cba" />
            <meta
              name="msapplication-config"
              content="/icons/browserconfig.xml"
            />
            <meta name="theme-color" content="#282A36" />
            <meta
              name="description"
              content="An alternate frontend for Ultimate Guitar"
            />
          </Head>
          <Component {...pageProps} />
        </Layout>
      </SessionProvider>
    </GlobalProvider>
  );
}
