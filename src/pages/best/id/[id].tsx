import { ROUTE_PREFIX } from "@/constants";
import { createContextInner } from "@/server/context";
import { appRouter } from "@/server/routers/_app";
import { UGApi } from "@/server/ug-interface/ug-api";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { GetStaticPropsContext } from "next";

export default function Tab() {
  return <></>;
}

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export const getStaticProps = async ({ params }: GetStaticPropsContext) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: await createContextInner(),
  });
  if (params === undefined) {
    return {
      notFound: true,
    };
  }

  if (typeof params.id !== "string") {
    return {
      notFound: true,
    };
  }

  const originalId = Number(params.id);
  const tabData = await UGApi.getTab({
    tab_id: originalId,
  });
  const bestAltVersion = tabData.versions?.length
    ? tabData.versions.reduce((a, b) => (a.rating > b.rating ? a : b))
    : tabData;
  const bestVersion =
    bestAltVersion.rating > tabData.rating ? bestAltVersion : tabData;

  // await helpers.tab.getTabDataWithoutDatabase.prefetch(originalId);

  // return {
  //   redirect: {
  //     destination: "/best/tab/" + cleanUrl(tab.urlWeb),
  //   },
  // };
  return {
    redirect: {
      destination: ROUTE_PREFIX.ID + "/" + bestVersion.id,
    },
    revalidate: 1,
  };
};
