import { UGAdapter } from "@/server/ug-interface/ug-interface";
import { z } from "zod";
import { createRouter, publicProcedure } from "../trpc";
import { getTab } from "../ug-interface/get-tab";

export const tabRouter = createRouter({
  getTab: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return await getTab(input);
  }),
  getTabLazy: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return await getTab(input);
    }),

  searchTabsInternalFuzzy: publicProcedure
    .input(
      z.object({
        value: z.string(),
        search_type: z.string(),
        cursor: z.number().gt(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const tabIdRows: {
        id: number;
        name: string;
        artist: string;
        sm1: number;
        sm2: number;
        sm3: number;
      }[] = await ctx.prisma.$queryRawUnsafe(
        `
        SELECT 
          s."id", 
          s."name",
          s."artist",
          -- get similarity based on whole search term
          similarity(s."name", $1) AS sml1, 
          similarity(s."artist", $1) AS sml2,
          -- merge similarity to rank on
          similarity(s."name", $1) + similarity(s."artist", $1) AS sm3
        FROM public."Tab" t INNER JOIN public."Song" s ON t."songId" = s."id"
        WHERE
          -- filter out anything where there is no word overlap
          word_similarity(s."name", $1) > 0.3
          OR word_similarity(s."artist", $1) > 0.3
        ORDER by
          sm3 DESC,
          t.rating DESC
        LIMIT 30 OFFSET $2;
      `,
        input.value,
        (input.cursor - 1) * 10
      );

      const items = await ctx.prisma.tab.findMany({
        include: {
          song: true,
        },
        where: {
          songId: {
            in: tabIdRows.map((i) => i.id),
          },
        },
      });
      return {
        items: items.map((i) => ({ ...i, internal: true, tab: undefined })),
        nextCursor: items.length === 10 ? input.cursor + 1 : undefined,
      };
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
        skip: (input.cursor - 1) * 10,
      });

      return {
        items: items.map((i) => ({ ...i, internal: true, tab: undefined })),
        nextCursor: items.length === 10 ? input.cursor + 1 : undefined,
      };
    }),

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
