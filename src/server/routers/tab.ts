import { UGAdapter } from "@/server/ug-interface/ug-interface";
import { z } from "zod";
import { querySitemap } from "../search-query";
import { createRouter, publicProcedure } from "../trpc";
import { getHighestRatedTab, getTab } from "../ug-interface/get-tab";

const searchTabType = z.enum([
  "chords",
  "tabs",
  "ukulele",
  "bass",
  "drums",
  "all",
]);
export type SearchTabType = z.infer<typeof searchTabType>;

export const tabRouter = createRouter({
  getTab: publicProcedure.input(z.string()).query(async ({ input }) => {
    return await getTab(input);
  }),
  getTabLazy: publicProcedure.input(z.string()).mutation(async ({ input }) => {
    return await getTab(input);
  }),

  getHighestRatedTabs: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return await getHighestRatedTab(input);
    }),

  querySitemap: publicProcedure
    .input(
      z.object({
        value: z.string(),
        search_type: z.string(),
        tab_type: searchTabType,
        page_size: z.number().gt(0).lte(100),
        cursor: z.number().gt(0),
      })
    )
    .query(async ({ input }) => {
      return await querySitemap(
        input.value,
        input.tab_type,
        input.cursor,
        input.page_size
      );
    }),
  querySitemapLazy: publicProcedure
    .input(
      z.object({
        value: z.string(),
        tab_type: searchTabType,
        cursor: z.number().gt(0),
        page_size: z.number().gt(0).lte(100),
      })
    )
    .mutation(async ({ input }) => {
      return await querySitemap(
        input.value,
        input.tab_type,
        input.cursor,
        input.page_size
      );
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
      const PAGE_SIZE = 50;
      const tabIdRows: {
        id: number;
        name: string;
        artist: string;
        sml1: number;
        sml2: number;
        w_sm1: number;
        w_sm2: number;
        sml3: number;
      }[] = await ctx.prisma.$queryRawUnsafe(
        `
        SELECT 
          s."id", 
          s."name",
          s."artist",
          -- get similarity based on whole search term
          similarity(s."name", $1) AS sml1, 
          similarity(s."artist", $1) AS sml2,
          word_similarity(s."name", $1) AS w_sml1,
          word_similarity(s."artist", $1) AS w_sml2,
          -- merge similarity to rank on
          similarity(s."name", $1) + similarity(s."artist", $1) AS sml3
        FROM public."Song" s
        WHERE
          -- filter out anything where there is no word overlap
          word_similarity(s."name", $1) > 0.3
          OR word_similarity(s."artist", $1) > 0.3
        ORDER by
          sml3 DESC
        LIMIT $2 OFFSET $3;
      `,
        input.value,
        PAGE_SIZE,
        (input.cursor - 1) * PAGE_SIZE
      );
      console.log(tabIdRows);

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

      // sort by songId position in tabIdRows
      // TODO theres gotta be a more efficient way of doing this
      items.sort((a, b) => {
        const aPos = tabIdRows.findIndex((i) => i.id === a.songId);
        const bPos = tabIdRows.findIndex((i) => i.id === b.songId);
        return aPos - bPos;
      });
      return {
        items: items.map((i) => ({ ...i, internal: true, tab: undefined })),
        nextCursor: items.length >= PAGE_SIZE ? input.cursor + 1 : undefined,
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
      const PAGE_SIZE = 50;
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
        take: PAGE_SIZE,
        skip: (input.cursor - 1) * PAGE_SIZE,
      });

      return {
        items: items.map((i) => ({ ...i, internal: true, tab: undefined })),
        nextCursor: items.length >= PAGE_SIZE ? input.cursor + 1 : undefined,
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

  searchTabsExternalLazy: publicProcedure
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
