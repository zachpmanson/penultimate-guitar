import prisma from "@/server/prisma";
import { querySitemap } from "@/server/services/search-query";
import { SpotifyAdapter } from "@/server/spotify-interface/spotify-interface";
import { UGApi } from "@/server/ug-interface/ug-api";
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
        destination: "/best/" + taburl,
      },
    };
  } else {
    const song = await SpotifyAdapter.getTrack(trackId);
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

    return {
      redirect: {
        destination: "/original/" + topTab[0].id,
      },
    };
  }
};
