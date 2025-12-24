import { ROUTES } from "@/constants";
import { GetStaticPropsContext } from "next";
import { getBestTaburl } from "src/server/services/get-tab";
import prisma from "@/server/prisma";
import { trackToBestTaburl } from "src/server/services/assign-track";

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

  if (track) {
    const taburl = track.taburl;
    const bestTaburl = await getBestTaburl(taburl);

    return {
      redirect: {
        destination: ROUTES.TAB(bestTaburl),
      },
    };
  }

  const bestTaburl = await trackToBestTaburl(trackId);
  if (!bestTaburl) {
    return {
      notFound: true,
    };
  }
  return {
    redirect: {
      destination: ROUTES.TAB(bestTaburl),
    },
  };
};
