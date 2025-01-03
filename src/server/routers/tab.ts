import { TAB_TYPES } from "@/models/models";
import { UGAdapter } from "@/server/ug-interface/ug-interface";
import { cleanUrl } from "@/utils/url";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getHighestRatedTabs, getTab } from "../services/get-tab";
import {
  getTabDetailsFromOriginalId,
  getTabDetailsFromTaburl,
} from "../services/get-taburl-from-originalid";
import { search } from "../services/search";
import { querySitemap } from "../services/search-query";
import { createRouter, publicProcedure } from "../trpc";
import { UGApi } from "../ug-interface/ug-api";

const searchTabType = z.enum(TAB_TYPES);

export const tabRouter = createRouter({
  getTab: publicProcedure.input(z.string()).query(async ({ input }) => {
    try {
      const possibleTab = await getTabDetailsFromTaburl(input);
      return possibleTab;
    } catch (e) {
      console.error(e);
      throw new TRPCError({ code: "NOT_FOUND" });
    }
  }),

  getTabFromOriginalId: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      try {
        const possibleTab = await getTabDetailsFromOriginalId(input);
        return possibleTab;
      } catch (e) {
        console.error(e);
        throw new TRPCError({ code: "NOT_FOUND" });
      }
    }),

  getTabLazy: publicProcedure.input(z.string()).mutation(async ({ input }) => {
    return await getTab(input);
  }),

  getHighestRatedTabs: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return await getHighestRatedTabs(input);
    }),
  getHighestRatedTabLazy: publicProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      return await getHighestRatedTabs(input);
    }),

  search: publicProcedure
    .input(
      z.object({
        value: z.string(),
        cursor: z.number().gt(0),
        type: searchTabType,
      })
    )
    .query(async ({ input }) => await search(input)),

  searchLazy: publicProcedure
    .input(
      z.object({
        value: z.string(),
        cursor: z.number().gt(0),
        type: searchTabType,
      })
    )
    .mutation(async ({ input }) => await search(input)),

  searchOneLazy: publicProcedure
    .input(
      z.object({
        value: z.string(),
        type: searchTabType,
      })
    )
    .mutation(async ({ input }) => {
      const searchResult = await search({
        value: input.value,
        type: input.type,
        cursor: 1,
      });

      if (searchResult.items.length === 0) {
        return null;
      }

      const firstResult = searchResult.items[0];

      const tab = await UGApi.getTab({
        tab_id: firstResult.id,
      });
      return {
        ...firstResult,
        taburl: cleanUrl(tab.urlWeb),
      };
    }),

  querySitemap: publicProcedure
    .input(
      z.object({
        value: z.string(),
        artist: z.string().optional(),
        search_type: z.string(),
        tab_type: searchTabType,
        page_size: z.number().gt(0).lte(100),
        cursor: z.number().gt(0),
      })
    )
    .query(async ({ input }) => {
      return await querySitemap(
        input.value,
        input.artist,
        input.tab_type,
        input.cursor,
        input.page_size
      );
    }),
  querySitemapLazy: publicProcedure
    .input(
      z.object({
        value: z.string(),
        artist: z.string().optional(),
        tab_type: searchTabType,
        cursor: z.number().gt(0),
        page_size: z.number().gt(0).lte(100),
      })
    )
    .mutation(async ({ input }) => {
      return await querySitemap(
        input.value,
        input.artist,
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
