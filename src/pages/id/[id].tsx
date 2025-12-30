import TabBase from "@/components/tab/tabbase";
import { createContextInner } from "@/server/context";
import { appRouter } from "@/server/routers/_app";
import { trpc } from "@/utils/trpc";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { GetStaticPropsContext } from "next";
import LoadingSpinner from "src/components/loadingspinner";

export default function Tab({ id }: { trpcState: any; id: number }) {
  const { data, status } = trpc.tab.getTabFromOriginalId.useQuery(Number(id));

  if (status !== "success" || !data) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <TabBase tabDetails={data} />
    </>
  );
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

  await helpers.tab.getTabFromOriginalId.prefetch(originalId);

  // return {
  //   redirect: {
  //     destination: "/best/" + cleanUrl(tab.urlWeb),
  //   },
  // };
  return {
    props: {
      trpcState: helpers.dehydrate(),
      id: originalId,
    },
    revalidate: 1,
  };
};
