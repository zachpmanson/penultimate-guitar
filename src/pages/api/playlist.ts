import { getPlaylist } from "@/lib/spotify-interface/spotify-interface";
import { getSearch } from "@/lib/ug-interface/ug-interface";
import { Playlist, PlaylistDto, TabLinkProps, Track } from "@/models";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PlaylistDto>
) {
  if (Object.keys(req.body).length === 0) {
    res.status(400);
    return;
  }

  if (req.method === "POST") {
    const playlistId = req.body["playlistId"];
    const playlist: Playlist = await getPlaylist(playlistId);
    const tabs = await getPlaylistTabs(playlist.tracks);

    res.status(200).json({ title: playlist.name, tabs: tabs });
  }
}

async function getPlaylistTabs(tracks: Track[]): Promise<TabLinkProps[]> {
  const tabs: TabLinkProps[] = [];
  for (let track of tracks) {
    const search = `${track.name} ${track.artists[0]}`;
    const results = await getSearch(search, "title", 1);
    if (results.length > 0) {
      tabs.push({
        taburl: results[0].tab_url,
        name: results[0].song_name,
        artist: results[0].artist_name,
      });
    }
  }
  return tabs;
}
