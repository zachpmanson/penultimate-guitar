export type TabType = "Tab" | "Chords" | "Ukulele" | "Bass";

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
export type AltVersion = {
  tab_url?: string;
  taburl: string;
  rating: number;
  version: number;
  type?: string;
};

export type TabLinkProps = {
  taburl: string;
  name: string;
  artist: string;
  pinned?: boolean;
  version?: number;
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

export const blacklist = ["Pro", "Video", "Official", "Power"];

export type ContributorObj = {
  userid: string;
  username: string;
  usergroupid: string;
  iq: number;
};
