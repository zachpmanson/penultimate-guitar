import { z } from "zod";
import { publicProcedure, createRouter } from "../trpc";
import { userRouter } from "./user";
import { tabRouter } from "./tab";

export const appRouter = createRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  user: userRouter,
  tab: tabRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
