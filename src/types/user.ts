import { z } from "zod";

export const TabSchema = z.object({
  taburl: z.string(),
  name: z.string().nullable(),
  artist: z.string().nullable(),
  type: z.string().optional().nullable(),
  version: z.number().optional().nullable(),
  folder: z.string().optional(),
});

export const NewTabSchema = z.object({
  newTab: TabSchema,
});
export type PostSchema = z.infer<typeof NewTabSchema>;

export const DeleteTabLinkSchema = z.object({
  taburl: z.string(),
  folderName: z.string(),
});
export type DeleteTabLinkSchema = z.infer<typeof DeleteTabLinkSchema>;
type TabLink = {
  taburl: string;
  name: string | null;
  artist: string | null;
  type: string | null;
  version: number | null;
};

export type Folder = {
  name: string;
  id: number;
  spotifyUserId: string;
  playlistUrl: string | null;
  imageUrl: string | null;
  tabs: TabLink[];
};
