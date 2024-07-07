import { z } from "zod";
import { createRouter, publicProcedure } from "../trpc";
import { UGAdapter } from "@/server/ug-interface/ug-interface";
import prisma from "@/server/prisma";
import { TabDto, TabType } from "@/models/models";
import { insertTab } from "../insert-tab";
import { DEFAULT_TAB } from "@/types/tab";
import { TRPCError } from "@trpc/server";

export const tabRouter = createRouter({
  getTab: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    let props: TabDto = DEFAULT_TAB;

    let savedTab: any;
    try {
      savedTab = await prisma.tab.findUnique({
        where: {
          taburl: input,
        },
        include: {
          song: {
            include: {
              Tab: {
                select: {
                  taburl: true,
                  version: true,
                  rating: true,
                  type: true,
                },
              },
            },
          },
        },
      });
    } catch (e) {
      console.error("Find unique failed", e);
    }

    if (savedTab?.tab && savedTab?.tab !== "ALT") {
      props = {
        ...savedTab,
        type: savedTab.type as TabType,
        tuning: JSON.parse(savedTab.tuning ?? "{}"),
      };
    } else {
      const fullurl = `https://tabs.ultimate-guitar.com/tab/${input}`;

      const [song, tab, altVersions] = await UGAdapter.getTab(fullurl);
      if (tab.songId === undefined) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Couldn't find tab.",
          // optional: pass the original error to retain stack trace
          // cause: theError,
        });
      }
      tab.taburl = input;
      props = {
        ...tab,
        song: { ...song, Tab: [...altVersions, tab] },
      };
      insertTab(song, tab, altVersions).catch(() =>
        console.error("Database error occured for", tab.taburl)
      );
    }
    return props;
  }),

  searchTabs: publicProcedure
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
});

export type TabRouter = typeof tabRouter;
