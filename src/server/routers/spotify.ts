import { z } from "zod";
import { SpotifyApi } from "../spotify-interface/spotify-api";
import { createRouter, publicProcedure } from "../trpc";

export const spotifyRouter = createRouter({
  getPlaylistTracks: publicProcedure
    .input(
      z.object({
        playlistId: z.string(),
        cursor: z.number().int().min(0).optional(),
        pageSize: z.number().int().min(1).optional(),
      })
    )
    .query(async ({ input }) => {
      const page = input.cursor ?? 0;
      const result = await SpotifyApi.getPlaylistTracks(input.playlistId, page, input.pageSize);
      return {
        items: result.items,
        total: result.total,
        nextCursor: result.nextCursor,
      };
    }),
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
      if (ctx.session?.user?.id && input.save) {
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
      const playlist = await SpotifyApi.getPlaylist(input.playlistId);
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
});

export type SpotifyRouter = typeof spotifyRouter;
