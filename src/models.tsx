export type TabDto = {
  capo?: number;
  tuning?: {
    name: string;
    value: string;
    index: number;
  };
  contributors?: string[];
  taburl: string;
  tab: string;
  name: string;
  artist: string;
};

export type TabLinkProps = {
  taburl: string;
  name: string;
  artist: string;
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

export const blacklist = ["Pro", "Video", "Official"];
