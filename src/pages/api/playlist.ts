import { getPlaylist } from "@/lib/spotify-interface/spotify-interface";
import { Playlist } from "@/models/models";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Playlist>
) {
  if (Object.keys(req.body).length === 0) {
    res.status(400);
    return;
  }

  if (req.method === "POST") {
    if (!req.body["playlistId"]) {
      res.status(400);
      return;
    }

    const playlistId = req.body["playlistId"];
    const playlist: Playlist = await getPlaylist(playlistId);
    res.status(200).json(playlist);
    return;
  }
}
