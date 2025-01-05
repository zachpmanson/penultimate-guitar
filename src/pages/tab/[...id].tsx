import TabBase from "@/components/tab/tabbase";
import { createContextInner } from "@/server/context";
import { appRouter } from "@/server/routers/_app";
import { trpc } from "@/utils/trpc";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { GetStaticProps } from "next";
import "react-tooltip/dist/react-tooltip.css";

export default function Tab({ id }: { trpcState: any; id: string }) {
  const { data, status } = trpc.tab.getTab.useQuery(id);
  if (status !== "success" || !data) {
    return <>Loading...</>;
  }
  return <TabBase tabDetails={data} />;
}

/* ============= SERVER SIDE ============= */
export async function getStaticPaths() {
  // TODO removed proper path discovery because build time was too long

  // const savedTabs = await prisma.tab.findMany({
  //   where: {
  //     tab: {
  //       not: "ALT",
  //     },
  //   },
  //   select: {
  //     taburl: true,
  //   },
  // });

  // const paths = savedTabs.map((tab) => ({
  //   params: { id: tab.taburl.split("/") },
  // }));

  return { paths: [], fallback: "blocking" };
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: await createContextInner(),
  });

  if (params === undefined) {
    return {
      notFound: true,
    };
  }

  if (typeof params.id !== "object") {
    return {
      notFound: true,
    };
  }

  const url = params.id.join("/");
  await helpers.tab.getTab.prefetch(url);

  return {
    props: {
      trpcState: helpers.dehydrate(),
      id: url,
    },
    revalidate: 1,
  };
};
