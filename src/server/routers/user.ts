import { SpotifyApi } from "@/server/spotify-interface/spotify-api";
import { DeleteTabLinkSchema, NewTabSchema, TabSchema } from "@/types/user";
import { z } from "zod";
import { authProcedure, createRouter } from "../trpc";

export const userRouter = createRouter({
  // Current account's Spotify link state, for the Connect-Spotify affordance.
  me: authProcedure.query(async ({ ctx }) => ({
    username: ctx.account.username,
    spotifyUserId: ctx.account.spotifyUserId,
  })),

  // Unlink the Spotify account. Clears the linked spotify id and the stored
  // refresh token so the app stops acting on the user's behalf; the edge
  // (basic) identity is untouched, so they can reconnect later via Connect.
  disconnectSpotify: authProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.user.update({
      where: { id: ctx.account.id },
      data: {
        spotifyUserId: null,
        spotifyRefreshToken: null,
      },
    });
    return { ok: true };
  }),

  getTabLinks: authProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.folder.findMany({
      where: {
        userId: ctx.account.id,
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
        userId: ctx.account.id,
      },
      update: {},
      where: {
        name_userId: {
          name: folderName,
          userId: ctx.account.id,
        },
      },
    });

    const result = await ctx.prisma.userTablink.upsert({
      create: {
        taburl,
        folderId: folderRow.id,
        name,
        artist,
        type,
        version,
        loadBest,
      },
      update: {
        taburl,
        folderId: folderRow.id,
        name,
        artist,
        type,
        version,
        loadBest,
      },
      where: {
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
          userId: ctx.account.id,
        },
      },
    });
    return result;
  }),

  deleteFolder: authProcedure.input(z.object({ folderName: z.string() })).mutation(async ({ ctx, input }) => {
    const { folderName } = input;
    const result = await ctx.prisma.folder.delete({
      where: {
        name_userId: {
          name: folderName,
          userId: ctx.account.id,
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
            userId: ctx.account.id,
          },
        });

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
            userId: ctx.account.id,
          })),
          skipDuplicates: true,
        });

        // remove tablinks that aren't in these folders
        const result = await tx.userTablink.deleteMany({
          where: {
            taburl: input.tab.taburl,
            folder: {
              userId: ctx.account.id,
              NOT: {
                name: { in: input.folders },
              },
            },
          },
        });

        const allFolders = await tx.folder.findMany({
          where: {
            name: { in: input.folders },
            userId: ctx.account.id,
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

  // Currently this uses the client input to set the best tab.
  // Because of this, only update where usertablink belongs to authed user.
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
          folder: { userId: ctx.account.id },
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
      // Per-user playlists need a linked Spotify account + a user-scoped token.
      // Without a linked account there is nothing to list — surfaced to the UI
      // as a "connect Spotify" affordance rather than an empty list.
      return await SpotifyApi.getUserPlaylists(ctx.account, input.cursor, input.pageSize);
    }),
});

export type UserRouter = typeof userRouter;