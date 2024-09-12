import { UGAdapter } from "@/server/ug-interface/ug-interface";
import { z } from "zod";
import { createRouter, publicProcedure } from "../trpc";
import { getTab } from "../ug-interface/get-tab";
import { sqltag } from "@prisma/client/runtime/library";

export const tabRouter = createRouter({
  getTab: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return await getTab(input);
  }),
  getTabLazy: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return await getTab(input);
    }),
  searchTabsInternal: publicProcedure
    .input(
      z.object({
        value: z.string(),
        search_type: z.string(),
        cursor: z.number().gt(0),
      })
    )
    .query(async ({ ctx, input }) => {
      console.log(input.cursor - 1 * 10);

      const items = await ctx.prisma.tab.findMany({
        include: {
          song: true,
        },
        where: {
          OR: [
            {
              song: {
                name: {
                  contains: input.value,
                  mode: "insensitive",
                },
              },
            },
            {
              song: {
                artist: {
                  contains: input.value,
                  mode: "insensitive",
                },
              },
            },
          ],
        },
        orderBy: {
          rating: "desc",
        },
        take: 10,
        skip: input.cursor,
      });
      console.log(items.map((i) => i.taburl));
      return {
        items: items.map((i) => ({ ...i, internal: true })),
        nextCursor: items.length === 10 ? input.cursor + 1 : undefined,
      };
      // return await ctx.prisma.$queryRaw`
      //   SELECT *
      //   FROM public."Tab" t JOIN public."Song" s
      //     ON t."songId" = s."id"
      //   WHERE
      //     s."name" ILIKE '%${input.value}%'`;
    }),
  // LIMIT 10 OFFSET ${input.cursor - 1 * 10};`;
  // -- similarity(s."name", ${input.value}) > 0.45
  // -- ORDER BY
  // -- similarity(s.name, ${input.value}) DESC,
  // --   public.Tab.rating DESC,
  // --   public.Tab.timestamp DESC
  searchTabsExternal: publicProcedure
    .input(
      z.object({
        value: z.string(),
        search_type: z.string(),
        cursor: z.number().gt(0),
      })
    )
    .query(async ({ ctx, input }) => {
      return await UGAdapter.getSearch(
        input.value,
        input.search_type,
        input.cursor
      );
    }),
  searchTabsLazy: publicProcedure
    .input(
      z.object({
        value: z.string(),
        search_type: z.string(),
        cursor: z.number().gt(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await UGAdapter.getSearch(
        input.value,
        input.search_type,
        input.cursor
      );
    }),
  getRecentTabs: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.tab.findMany({
        orderBy: {
          timestamp: "desc",
        },
        take: input,
        include: {
          song: true,
        },
      });
    }),
});

export type TabRouter = typeof tabRouter;
