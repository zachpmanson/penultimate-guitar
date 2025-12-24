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
  user: userRouter,
  tab: tabRouter,
  spotify: spotifyRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
