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
});
export type PostSchema = z.infer<typeof NewTabSchema>;

type TabLink = {
  taburl: string;
  name: string | null;
  artist: string | null;
  type: string | null;
  version: number | null;
};

export type Folder = {
  name: string;
  id: string;
  spotifyUserId: string;
  playlistUrl: string | null;
  imageUrl: string | null;
  tabs: TabLink[];
};
