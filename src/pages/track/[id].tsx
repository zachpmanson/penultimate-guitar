import { ROUTES } from "@/constants";
import prisma from "@/server/prisma";
import { querySitemap } from "@/server/services/search-query";
import { SpotifyApi } from "@/server/spotify-interface/spotify-api";
import { UGApi } from "@/server/ug-interface/ug-api";
import { extractTaburl } from "@/utils/url";
import { GetStaticPropsContext } from "next";

export default function Tab() {
  return <></>;
}

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export const getStaticProps = async ({ params }: GetStaticPropsContext) => {
  if (params === undefined) {
    return {
      notFound: true,
    };
  }
  console.log(params);
  if (typeof params.id !== "string") {
    return {
      notFound: true,
    };
  }

  const trackId = params.id;

  const track = await prisma.trackTab.findFirst({
    where: {
      spotifyTrackId: trackId,
    },
  });

  let taburl: string;
  if (track) {
    taburl = track.taburl;
    return {
      redirect: {
        destination: ROUTES.BEST_TAB(taburl),
      },
    };
  } else {
    const song = await SpotifyApi.getTrack(trackId);
    const topTab = await UGApi.getSearch({
      title: `${song.name} ${song.artists[0]}`,
      page: 1,
      type: 300,
    });
    if (topTab.length === 0) {
      return {
        notFound: true,
      };
    }

    const tabdetails = await UGApi.getTab({
      tab_id: topTab[0].id,
    });

    return {
      redirect: {
        destination: ROUTES.BEST_TAB(extractTaburl(tabdetails.urlWeb)),
      },
    };
  }
};
