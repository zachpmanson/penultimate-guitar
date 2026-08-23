import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import type { AppRouter } from "../server/routers/_app";
import { basePath } from "./basePath";

function getBaseUrl() {
  if (typeof window !== "undefined")
    // Browser should use a relative path, prefixed with the Next.js basePath
    // when served from a sub-route (e.g. /staging).
    return basePath;

  // Server-side: this instance serves its API under basePath too.
  return `http://localhost:${process.env.PORT ?? 3000}${basePath}`;
}

export const trpc = createTRPCNext<AppRouter>({
  config(opts) {
    return {
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" || (opts.direction === "down" && opts.result instanceof Error),
        }),
        httpBatchLink({
          /**
           * If you want to use SSR, you need to use the server's full URL
           * @link https://trpc.io/docs/v11/ssr
           **/
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
});
