import { httpBatchLink, httpLink, loggerLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import type { AppRouter } from "../server/routers/_app";
import superjson from "superjson";

function getBaseUrl() {
  if (typeof window !== "undefined")
    // browser should use relative path
    return "";

  // assume localhost
  return process.env.BASE_URL ?? "http://localhost:3000";
}

export const trpc = createTRPCNext<AppRouter>({
  config(opts) {
    return {
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.ENVIRONMENT === "development" || (opts.direction === "down" && opts.result instanceof Error),
        }),
        httpBatchLink({
          /**
           * If you want to use SSR, you need to use the server's full URL
           * @link https://trpc.io/docs/v11/ssr
           **/
          transformer: superjson,
          url: `${getBaseUrl()}/api/trpc`,
          async headers() {
            return {
              // authorization: getAuthCookie(),
            };
          },
        }),
      ],
      queryClientConfig: {
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      },
    };
  },
  /**
   * @link https://trpc.io/docs/v11/ssr
   **/
  ssr: false,
  transformer: superjson,
});
