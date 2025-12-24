import { SpotifyApi } from "@/server/spotify-interface/spotify-api";
import { DeleteTabLinkSchema, NewTabSchema, TabSchema } from "@/types/user";
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

  addTabLink: authProcedure.input(NewTabSchema).mutation(async ({ ctx, input }) => {
    const {
      newTab: { taburl, name, artist, type, version, folder, loadBest },
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
        loadBest,
      },
      update: {
        // spotifyUserId: ctx.session.user.id,
        taburl,
        folderId: folderRow.id,
        name,
        artist,
        type,
        version,
        loadBest,
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

  deleteTabLink: authProcedure.input(DeleteTabLinkSchema).mutation(async ({ ctx, input }) => {
    const { taburl, folderName } = input;

    const result = await ctx.prisma.userTablink.deleteMany({
      where: {
        taburl,
        folder: {
          name: folderName,
          spotifyUserId: ctx.session.user.id,
        },
      },
    });
    return result;
  }),

  deleteFolder: authProcedure.input(z.object({ folderName: z.string() })).mutation(async ({ ctx, input }) => {
    const { folderName } = input;
    const result = await ctx.prisma.folder.delete({
      where: {
        name_spotifyUserId: {
          name: folderName,
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

        // Only works in Node v22
        // const missingFolders: Set<string> = (
        //   new Set(
        //     existingFolders.map((folder) => folder.name)
        //   ) as Set<string> & {
        //     symmetricDifference: (s: Set<string>) => Set<string>; // hopefully can remove this
        //   }
        // ).symmetricDifference(new Set([...input.folders]));

        let a = new Set(existingFolders.map((folder) => folder.name));
        let b = new Set(input.folders);

        let a_minus_b = new Set([...a].filter((x) => !b.has(x)));
        let b_minus_a = new Set([...b].filter((x) => !a.has(x)));

        const a_outersect_b = new Set([...a_minus_b, ...b_minus_a]);
        const missingFolders = a_outersect_b;

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
          skipDuplicates: true,
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
          skipDuplicates: true,
        });
        return { count: newTabs.count };
      });
      return count;
    }),

  // Currently this uses the client input to set the best tab
  // Because of this, only update where usertablink belongs to authed user
  setBestTab: authProcedure
    .input(
      z.object({
        oldTaburl: z.string(),
        newTab: z.object({
          taburl: z.string(),
          type: z.string(),
          version: z.number(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const u = await ctx.prisma.userTablink.updateMany({
        where: {
          loadBest: true,
          taburl: input.oldTaburl,
          folder: { spotifyUserId: ctx.session.user.id },
        },
        data: {
          loadBest: false,
          taburl: input.newTab.taburl,
          type: input.newTab.type,
          version: input.newTab.version,
        },
      });
      return u.count;
    }),

  getPlaylists: authProcedure
    .input(
      z.object({
        cursor: z.number(),
        pageSize: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await SpotifyApi.getUserPlaylists(ctx.session.user.id, input.cursor, input.pageSize);
    }),
});

export type UserRouter = typeof userRouter;
