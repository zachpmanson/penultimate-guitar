import { SpotifyAdapter } from "@/server/spotify-interface/spotify-interface";
import { NewTabSchema, TabSchema } from "@/types/user";
import { z } from "zod";
import { authProcedure, createRouter } from "../trpc";

export const userRouter = createRouter({
  getTabLinks: authProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.folder.findMany({
      where: {
        spotifyUserId: ctx.session.user.id,
      },
      include: {
        tabs: true,
      },
    });
  }),

  addTabLink: authProcedure
    .input(NewTabSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        newTab: { taburl, name, artist, type, version, folder },
      } = input;

      // create folder if it doesn't exist
      const folderName = folder ?? "Favourites";
      const folderRow = await ctx.prisma.folder.upsert({
        create: {
          name: folderName,
          spotifyUserId: ctx.session.user.id,
        },
        update: {},
        where: {
          name_spotifyUserId: {
            name: folderName,
            spotifyUserId: ctx.session.user.id,
          },
        },
      });

      const result = await ctx.prisma.userTablink.upsert({
        create: {
          // spotifyUserId: ctx.session.user.id,
          taburl,
          folderId: folderRow.id,
          name,
          artist,
          type,
          version,
        },
        update: {
          // spotifyUserId: ctx.session.user.id,
          taburl,
          folderId: folderRow.id,
          name,
          artist,
          type,
          version,
        },
        where: {
          // spotifyUserId: ctx.session.user.id,
          taburl_folderId: {
            taburl,
            folderId: folderRow.id,
          },
        },
      });

      return result;
    }),

  deleteTabLink: authProcedure
    .input(TabSchema)
    .mutation(async ({ ctx, input }) => {
      const { taburl, folder } = input;

      const result = await ctx.prisma.userTablink.deleteMany({
        where: {
          taburl,
          folder: {
            name: folder,
            spotifyUserId: ctx.session.user.id,
          },
        },
      });
      return result;
    }),

  setTabLinks: authProcedure
    .input(
      z.object({
        tab: TabSchema,
        folders: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const count = ctx.prisma.$transaction(async (tx) => {
        const existingFolders = await tx.folder.findMany({
          where: {
            name: { in: input.folders },
            spotifyUserId: ctx.session.user.id,
          },
        });

        const missingFolders: Set<string> = (
          new Set(
            existingFolders.map((folder) => folder.name)
          ) as Set<string> & {
            symmetricDifference: (s: Set<string>) => Set<string>; // hopefully can remove this
          }
        ).symmetricDifference(new Set([...input.folders]));

        console.log({
          existingFolders: existingFolders.map((folder) => folder.name),
          missingFolders,
          folders: input.folders,
        });
        // create missing folders
        await tx.folder.createMany({
          data: [...missingFolders].map((folder) => ({
            name: folder,
            spotifyUserId: ctx.session.user.id,
          })),
        });

        // remove tablinks that aren't in these folders
        const result = await tx.userTablink.deleteMany({
          where: {
            taburl: input.tab.taburl,
            folder: {
              spotifyUserId: ctx.session.user.id,
              NOT: {
                name: { in: input.folders },
              },
            },
          },
        });

        const allFolders = await tx.folder.findMany({
          where: {
            name: { in: input.folders },
            spotifyUserId: ctx.session.user.id,
          },
        });
        console.log({ allFolders });
        // create tablinks in the new folders
        const newTabs = await tx.userTablink.createMany({
          data: allFolders.map((folder) => ({
            taburl: input.tab.taburl,
            name: input.tab.name,
            artist: input.tab.artist,
            type: input.tab.type,
            version: input.tab.version,
            folderId: folder.id,
          })),
        });
        return { count: newTabs.count };
      });
      return count;
    }),

  getPlaylists: authProcedure
    .input(
      z.object({
        cursor: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await SpotifyAdapter.getUserPlaylists(
        ctx.session.user.id,
        input.cursor
      );
    }),
});

export type UserRouter = typeof userRouter;
