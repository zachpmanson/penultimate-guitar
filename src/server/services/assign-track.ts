import prisma from "@/server/prisma";
import { SpotifyApi } from "../spotify-interface/spotify-api";
import { UGApi } from "../ug-interface/ug-api";
import { extractTaburl } from "src/utils/url";
import { getBestTaburl } from "./get-tab";

async function assignTrack(trackId: string, tabUrl: string) {
  await prisma.trackTab.upsert({
    where: {
      spotifyTrackId: trackId,
    },
    update: {
      taburl: tabUrl,
    },
    create: {
      spotifyTrackId: trackId,
      taburl: tabUrl,
    },
  });
}

export async function trackToBestTaburl(trackId: string) {
  const song = await SpotifyApi.getTrack(trackId);
  const topTab = await UGApi.getSearch({
    title: `${song.name} ${song.artists[0]}`,
    page: 1,
    type: 300,
  });
  if (topTab.length === 0) {
    return null;
  }

  const tabdetails = await UGApi.getTab({
    tab_id: topTab[0].id,
  });

  const taburl = extractTaburl(tabdetails.urlWeb);
  const bestTaburl = await getBestTaburl(taburl);

  assignTrack(trackId, bestTaburl)
    .then((res) => console.log(`Upserted taburl ${bestTaburl} to track ${trackId}`))
    .catch((e) => console.error(`Failed to upsert taburl ${bestTaburl} to track ${trackId}`, e));

  return taburl;
}
