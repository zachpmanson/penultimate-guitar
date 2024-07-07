import { z } from "zod";
import { publicProcedure, createRouter } from "../trpc";
import { userRouter } from "./user";
import { tabRouter } from "./tab";
import { SpotifyAdapter } from "../spotify-interface/spotify-interface";

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

  getPlaylists: publicProcedure
    .input(
      z.object({
        playlistId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await SpotifyAdapter.getPlaylist(input.playlistId);
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
