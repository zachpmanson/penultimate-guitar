import { z } from "zod";
import { createRouter, publicProcedure } from "../trpc";
import { spotifyRouter } from "./spotify";
import { tabRouter } from "./tab";
import { userRouter } from "./user";

export const appRouter = createRouter({
  hello: publicProcedure.input(z.object({ text: z.string() })).query(({ input }) => {
    return {
      greeting: `Hello ${input.text}`,
    };
  }),
  // Identity: tells the client who the edge authenticated for the current
  // request (or that it's anonymous). Feeds the sign-in badge / login affordances.
  auth: createRouter({
    whoami: publicProcedure.query(({ ctx }) => ({ user: ctx.user })),
  }),
  user: userRouter,
  tab: tabRouter,
  spotify: spotifyRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;