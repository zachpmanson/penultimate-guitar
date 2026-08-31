import { TRPCError, initTRPC } from "@trpc/server";
import { Context } from "./context";
import { getOrCreateAccountByUsername } from "./account";

// Avoid exporting the entire t-object since it's not very descriptive.
// For instance, the use of a t variable is common in i18n libraries.
const t = initTRPC.context<Context>().create();

// Base router and procedure helpers
export const createRouter = t.router;

export const publicProcedure = t.procedure;

// Requires an authenticated edge identity (Caddy-stamped username) and resolves
// the owning User row. Procedures using this can rely on `ctx.account` being set.
const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const account = await getOrCreateAccountByUsername(ctx.user);
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      account,
    },
  });
});

export type AuthedContext = Context & {
  user: string;
  account: { id: string; username: string; spotifyUserId: string | null; spotifyRefreshToken: string | null };
};

export const authProcedure = t.procedure.use(enforceUserIsAuthed);