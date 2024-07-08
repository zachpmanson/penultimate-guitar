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
