import prisma from "@/server/prisma";
import { querySitemap } from "@/server/search-query";
import { SpotifyAdapter } from "@/server/spotify-interface/spotify-interface";
import { GetStaticPropsContext } from "next";
import "react-tooltip/dist/react-tooltip.css";

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
  if (typeof params.id !== "object") {
    return {
      notFound: true,
    };
  }

  const trackId = params.id.join("/");

  const track = await prisma.trackTab.findFirst({
    where: {
      spotifyTrackId: trackId,
    },
  });
  console.log(track);
  let taburl: string;
  if (track) {
    taburl = track.taburl;
  } else {
    // search and insert results
    const song = await SpotifyAdapter.getTrack(trackId);
    console.log(song);
    const topTab = await querySitemap(
      song.name,
      song.artists.join(" "),
      "chords",
      1,
      1
    );
    if (topTab.items.length === 0) {
      return {
        notFound: true,
      };
    }

    taburl = topTab.items[0].tabs[0].taburl;
    prisma.trackTab
      .create({
        data: {
          spotifyTrackId: trackId,
          taburl: taburl,
        },
      })
      .then(() => {})
      .catch(() => {});
  }

  return {
    redirect: {
      destination: "/best/" + taburl,
    },
  };
};
