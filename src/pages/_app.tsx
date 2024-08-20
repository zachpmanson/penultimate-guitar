import Layout from "@/components/layout";
import GlobalProvider from "@/contexts/Global";
import "@/styles/globals.css";
import type { NextPage } from "next";
import { SessionProvider } from "next-auth/react";
import type { AppProps, AppType } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import NProgress from "nprogress";
import { ReactElement, ReactNode, useEffect } from "react";
import "../styles/nprogress.css";
import { trpc } from "../utils/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function App({ Component, pageProps }: AppPropsWithLayout) {
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
  const layout = getLayout(
    <Layout>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="Find the cheapest drinks, per standard"
        />
        <link rel="icon" href="/icons/guitar-icon.svg" type="image/svg+xml" />

        <meta name="msapplication-TileColor" content="#603cba" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="theme-color" content="#282A36" />
        <meta
          name="description"
          content="An alternate frontend for Ultimate Guitar"
        />
      </Head>
      <Component {...pageProps} />
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-2Q5B9DT8HJ"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-2Q5B9DT8HJ');
    `}
      </Script>
    </Layout>,
  );
  return (
    <SessionProvider session={pageProps.session}>
      <GlobalProvider>
        <ThemeProvider defaultTheme="system" attribute="class">
          {layout}
        </ThemeProvider>
      </GlobalProvider>
    </SessionProvider>
  );
}

export default trpc.withTRPC(App);
