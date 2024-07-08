import { z } from "zod";
import { createRouter, publicProcedure } from "../trpc";
import { UGAdapter } from "@/server/ug-interface/ug-interface";
import prisma from "@/server/prisma";
import { TabDto, TabType } from "@/models/models";
import { insertTab } from "../insert-tab";
import { DEFAULT_TAB } from "@/types/tab";
import { TRPCError } from "@trpc/server";
import { getTab } from "../get-tab";

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
