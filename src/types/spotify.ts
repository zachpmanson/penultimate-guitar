export type SpotifyPlaylistResponse = {
  href: string;
  limit: number;
  next: string;
  offset: number;
  previous: string | null;
  total: number;
  items: Playlist[];
};

export type Playlist = {
  collaborative: boolean;
  description: string;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: Image[];
  name: string;
  owner: Owner;
  primary_color: string | null;
  public: boolean;
  snapshot_id: string;
  tracks: Tracks;
  type: string;
  uri: string;
};

type ExternalUrls = {
  spotify: string;
};

type Image = {
  height: number;
  url: string;
  width: number;
};

type Owner = {
  display_name: string;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  type: string;
  uri: string;
};

type Tracks = {
  href: string;
  total: number;
};
