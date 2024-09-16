import { UGAdapter } from "@/server/ug-interface/ug-interface";
import { z } from "zod";
import { createRouter, publicProcedure } from "../trpc";
import { getHighestRatedTab, getTab } from "../ug-interface/get-tab";

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

  searchTabsExternalFuzzy: publicProcedure
    .input(
      z.object({
        value: z.string(),
        search_type: z.string(),
        cursor: z.number().gt(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const PAGE_SIZE = 20;
      const songRows: {
        name: string;
        artist: string;
        taburl: string[];
        tabid: number[];
        type: string[];
        sml1: number;
        sml2: number;
        w_sm1: number;
        w_sm2: number;
        sml3: number;
      }[] = await ctx.prisma.$queryRawUnsafe(
        `
         with CloseSongs as (
          select 
                s."name",
                s."artist",
                s."taburl",
                s."type",
                -- get similarity based on whole search term
                similarity(s."name", $1) AS sml1, 
                similarity(s."artist", $1) AS sml2,
                word_similarity(s."name", $1) AS w_sml1,
                word_similarity(s."artist", $1) AS w_sml2,
                -- merge similarity to rank on
                similarity(s."name", $1) + similarity(s."artist", $1) AS sml3
          from public."PossibleSong" s
          WHERE
                -- filter out anything where there is no word overlap
                word_similarity(s."name", $1) > 0.3
                OR word_similarity(s."artist", $1) > 0.3
        )

        SELECT 
          s."name",
          s."artist",
          array_agg(s."taburl") as taburl, 
          array_agg(ut."id") as tabId,
          array_agg(s."type") as type,
          -- get similarity based on whole search term
          similarity(s."name", $1) AS sml1, 
          similarity(s."artist", $1) AS sml2,
          word_similarity(s."name", $1) AS w_sml1,
          word_similarity(s."artist", $1) AS w_sml2,
          -- merge similarity to rank on
          similarity(s."name", $1) + similarity(s."artist", $1) AS sml3
        FROM CloseSongs s
        left join public."Tab" ut on s."taburl" = ut."taburl"
        -- TODO add a join to Song to get the real name and artist, prefer over the PossibleSong values
        group by 
          (s."name", s."artist")
        ORDER by
          sml3 DESC
        LIMIT ${PAGE_SIZE} OFFSET $2;
        `,
        input.value,
        (input.cursor - 1) * PAGE_SIZE
      );

      console.log(songRows);
      const a = songRows.map((t) => {
        let types = [];
        let hasTypes = {
          chords: false,
          tab: false,
          ukulele: false,
          bass: false,
        };
        for (let i = 0; i < t.taburl.length; i++) {
          if (t.type[i] === "chords") {
            if (hasTypes.chords) continue;
            hasTypes.chords = true;
          }

          if (t.type[i] === "tabs") {
            if (hasTypes.tab) continue;
            hasTypes.tab = true;
          }

          if (t.type[i] === "ukulele") {
            if (hasTypes.ukulele) continue;
            hasTypes.ukulele = true;
          }

          if (t.type[i] === "bass") {
            if (hasTypes.bass) continue;
            hasTypes.bass = true;
          }

          types.push({
            type: t.type[i],
            taburl: t.taburl[i],
            tabId: t.tabid?.[i],
          });
        }
        let index = t.type.findIndex((t) => t === "chords");
        if (index === -1) index = t.type.findIndex((t) => t === "tab");
        if (index === -1) index = 0;
        return {
          name: t.name,
          artist: t.artist,
          tabs: types,
        };
      });

      return {
        items: a,
        nextCursor: songRows.length >= PAGE_SIZE ? input.cursor + 1 : undefined,
      };
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
        LIMIT ${PAGE_SIZE} OFFSET $2;
      `,
        input.value,
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
