import { getPlaylist } from "@/lib/spotify-interface/spotify-interface";
import { getSearch } from "@/lib/ug-interface/ug-interface";
import { Playlist, PlaylistDto, TabLinkDto, Track } from "@/models";
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

async function getPlaylistTabs(tracks: Track[]): Promise<TabLinkDto[]> {
  const tabs: TabLinkDto[] = [];
  await Promise.all([
    ...tracks.map((track) => {
      return getSearch(`${track.name} ${track.artists}`, "title", 1).then(
        (results) => {
          results.sort((a, b) => b.rating - a.rating);
          const chordResults = results.filter((r) => r.type === "Chords");
          if (chordResults.length > 0) {
            tabs.push({
              taburl: chordResults[0].tab_url,
              name: chordResults[0].song_name,
              artist: chordResults[0].artist_name,
              version: chordResults[0].version,
            });
          } else if (results.length > 0) {
            tabs.push({
              taburl: results[0].tab_url,
              name: results[0].song_name,
              artist: results[0].artist_name,
              version: results[0].version,
            });
          }
          if (results.length === 0) {
            console.log(
              "Couldn't find",
              `${track.name} ${track.artists}`,
              results
            );
          } else {
            console.log(
              "Found",
              `${track.name} ${track.artists}`,
              `${results.length} results`
            );
          }
        }
      );
    }),
  ]);
  console.log(tabs.map((t) => t.taburl));
  return tabs;
}
