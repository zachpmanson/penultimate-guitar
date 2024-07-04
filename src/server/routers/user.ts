import { TabSchema, NewTabSchema } from "@/types/user";
import { authProcedure, createRouter } from "../trpc";

export const userRouter = createRouter({
  getTabLinks: authProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.userTablink.findMany({
      where: {
        spotifyUserId: ctx.session.user.id,
      },
    });
  }),

  addTabLink: authProcedure
    .input(NewTabSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        newTab: { taburl, name, artist, type, version },
        folders,
      } = input;

      for (const folder of folders) {
        await ctx.prisma.userTablink.upsert({
          create: {
            id: `${ctx.session.user.id}-${taburl}-${folder}`,
            spotifyUserId: ctx.session.user.id,
            taburl,
            folder,
            name,
            artist,
            type,
            version,
          },
          update: {
            spotifyUserId: ctx.session.user.id,
            taburl,
            folder,
            name,
            artist,
            type,
            version,
          },
          where: {
            id: `${ctx.session.user.id}-${taburl}-${folder}`,
          },
        });
      }

      const result = await ctx.prisma.userTablink.deleteMany({
        where: {
          spotifyUserId: ctx.session.user.id,
          taburl,
          NOT: {
            folder: {
              in: folders,
            },
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
          spotifyUserId: ctx.session.user.id,
          taburl,
          folder,
        },
      });
      return result;
    }),
});

// export type definition of API
export type UserRouter = typeof userRouter;
