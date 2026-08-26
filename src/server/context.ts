import prisma from "@/server/prisma";
import { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getUserFromHeaders } from "./auth";

interface CreateInnerContextOptions {
  /** Edge-authenticated identity (basicauth username), null for anonymous. */
  user: string | null;
}
/**
 * Inner context. Will always be available in your procedures, in contrast to
 * the outer context.
 *
 * Also useful for:
 * - testing, so you don't have to mock Next.js' `req`/`res`
 * - tRPC's `createServerSideHelpers` where we don't have `req`/`res`
 *
 * @link https://trpc.io/docs/v11/context#inner-and-outer-context
 */
export async function createContextInner(opts?: CreateInnerContextOptions) {
  return {
    prisma,
    user: opts?.user ?? null,
  };
}
export const createContext = async (opts: CreateNextContextOptions) => {
  const { req } = opts;
  return createContextInner({
    // Trust-the-edge: identity comes from the header Caddy stamps; the app
    // never parses credentials. Anonymous requests carry no header → null.
    user: getUserFromHeaders(req.headers),
  });
};

export type Context = Awaited<ReturnType<typeof createContextInner>>;