import { SpotifyAdapter } from "@/lib/spotify-interface/spotify-interface";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (Object.keys(req.body).length === 0) {
    res.status(400);
    return;
  }

  if (req.method === "POST") {
    // TODO switch to zod
    if (
      !req.body["userId"] ||
      req.body["page"] === undefined ||
      Number.isNaN(parseInt(req.body["page"])) ||
      +req.body["page"] < 0
    ) {
      res.status(400);
      return;
    }
    const userId = req.body["userId"];
    const page = +req.body["page"];
    const playlists: any = await SpotifyAdapter.getUserPlaylists(userId, page);
    res.status(200).json(playlists);
    return;
  }
}
