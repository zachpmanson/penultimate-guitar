import prisma from "@/server/prisma";
import { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { Session } from "next-auth";
import { getServerAuthSession } from "./auth";
import { appRouter } from "./routers/_app";
import { createServerSideHelpers } from "@trpc/react-query/server";

interface CreateInnerContextOptions extends Partial<CreateNextContextOptions> {
  session: Session | null;
}
/**
 * Inner context. Will always be available in your procedures, in contrast to the outer context.
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
    session: opts?.session,
  };
}
export const createContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;
  const session = await getServerAuthSession(req, res);
  const innerContext = await createContextInner({
    session,
  });
  return {
    ...innerContext,
  };
};

export type Context = Awaited<ReturnType<typeof createContextInner>>;
