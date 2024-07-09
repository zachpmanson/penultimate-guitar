import { z } from "zod";
import { SpotifyAdapter } from "../spotify-interface/spotify-interface";
import { createRouter, publicProcedure } from "../trpc";

export const spotifyRouter = createRouter({
  getPlaylist: publicProcedure
    .input(
      z.object({
        playlistId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await SpotifyAdapter.getPlaylist(input.playlistId);
    }),
  getPlaylistLazy: publicProcedure
    .input(
      z.object({
        playlistId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await SpotifyAdapter.getPlaylist(input.playlistId);
    }),
});

export type SpotifyRouter = typeof spotifyRouter;
