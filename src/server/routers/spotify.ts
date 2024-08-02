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
      const playlist = await SpotifyAdapter.getPlaylist(input.playlistId);
      if (ctx.session?.user?.id) {
        ctx.prisma.folder
          .upsert({
            create: {
              name: playlist.name,
              spotifyUserId: ctx.session.user.id,
              playlistUrl: input.playlistId,
              imageUrl: playlist.image,
            },
            update: {
              playlistUrl: input.playlistId,
              imageUrl: playlist.image,
            },
            where: {
              name_spotifyUserId: {
                name: playlist.name,
                spotifyUserId: ctx.session.user.id,
              },
            },
          })
          .then(() => {});
      }
      return playlist;
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
