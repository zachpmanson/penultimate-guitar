import { z } from "zod";
import { createRouter, publicProcedure } from "../trpc";
import { UGAdapter } from "@/server/ug-interface/ug-interface";

export const tabRouter = createRouter({
  searchTabs: publicProcedure
    .input(
      z.object({
        value: z.string(),
        search_type: z.string(),
        cursor: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await UGAdapter.getSearch(
        input.value,
        input.search_type,
        input.cursor
      );
    }),
});

export type TabRouter = typeof tabRouter;
