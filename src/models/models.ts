import { Folder } from "@/types/user";

// switched to string because I don't know all the different forms that Tab parts can come in
export type TabType = string;
// export type TabType = "Tab" | "Chords" | "Ukulele" | "Bass Tabs";

export type Mode = "default" | "guitalele";

export type TabDto = {
  rating: number;
  capo?: number;
  tuning?: {
    name: string;
    value: string;
    index: number;
  };
  contributors?: string[];
  taburl: string;
  tab: string;
  song: Song;
  version: number;
  songId: number;
  type: TabType;
};
export type Song = {
  id: number;
  name: string;
  artist: string;
  Tab?: AltVersion[];
};

// Tab object as taken from UG js-store, gets tranformed into TabDto
export type NewTab = {
  type: TabType;
  taburl: string;
  tab: string;
  songId: number;
  contributors: string[];
  capo: number;
  tuning?: {
    name: string;
    value: string;
    index: number;
  };
  rating: number;
  version: number;
};

// cut down version of NewTab with metadata only
export type AltVersion = {
  tab_url?: string;
  taburl: string;
  rating: number;
  version: number;
  type: string;
};

export type TabLinkDto = {
  taburl: string;
  name: string | null;
  artist: string | null;
  saved?: boolean | null;
  version?: number | null;
  type?: TabType | null;
  imageUrl?: string | null;
  playlistUrl?: string | null;
};

export type SavedUserTabLinks = {
  [userId: string]: Folder[];
};

export type SearchResult = {
  id: number;
  song_id: number;
  song_name: string;
  artist_id: number;
  artist_name: string;
  type: string;
  part: string;
  version: number;
  votes: number;
  rating: number;
  date: string;
  status: string;
  preset_id: number;
  tab_access_type: string;
  tp_version: number;
  tonality_name: string;
  version_description: string;
  verified: number;
  recording: {};
  artist_url: string;
  tab_url: string;
};

export type Track = { name: string; artists: string[] };
export type Playlist = {
  name: string;
  image?: string;
  owner: string;
  tracks: Track[];
  description: "";
};

export type PlaylistCollection = { [key: string]: string };
