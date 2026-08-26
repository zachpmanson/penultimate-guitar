import { z } from "zod";
import { SpotifyApi } from "../spotify-interface/spotify-api";
import { getOrCreateAccountByUsername } from "../account";
import { createRouter, publicProcedure } from "../trpc";

export const spotifyRouter = createRouter({
  getPlaylist: publicProcedure
    .input(
      z.object({
        playlistId: z.string(),
        save: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      console.log(input);
      const playlist = await SpotifyApi.getPlaylist(input.playlistId);
      // Persisting an imported playlist as a folder is only possible when we
      // know who's signed in; anonymous users get the public playlist back
      // without a saved folder.
      if (input.save && ctx.user) {
        const account = await getOrCreateAccountByUsername(ctx.user);
        ctx.prisma.folder
          .upsert({
            create: {
              name: playlist.name,
              userId: account.id,
              playlistUrl: input.playlistId,
              imageUrl: playlist.image,
            },
            update: {
              playlistUrl: input.playlistId,
              imageUrl: playlist.image,
            },
            where: {
              name_userId: {
                name: playlist.name,
                userId: account.id,
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
      const playlist = await SpotifyApi.getPlaylist(input.playlistId);
      if (ctx.user) {
        const account = await getOrCreateAccountByUsername(ctx.user);
        ctx.prisma.folder
          .upsert({
            create: {
              name: playlist.name,
              userId: account.id,
              playlistUrl: input.playlistId,
              imageUrl: playlist.image,
            },
            update: {
              playlistUrl: input.playlistId,
              imageUrl: playlist.image,
            },
            where: {
              name_userId: {
                name: playlist.name,
                userId: account.id,
              },
            },
          })
          .then(() => {});
      }
      return playlist;
    }),
});

export type SpotifyRouter = typeof spotifyRouter;