import { z } from "zod";

export const TabSchema = z.object({
  taburl: z.string(),
  name: z.string().nullable(),
  artist: z.string().nullable(),
  type: z.string().optional().nullable(),
  version: z.number().optional().nullable(),
  folder: z.string().optional(),
});
export type DeleteSchema = z.infer<typeof TabSchema>;

export const NewTabSchema = z.object({
  newTab: TabSchema,
  folders: z.array(z.string()),
});
export type PostSchema = z.infer<typeof NewTabSchema>;
