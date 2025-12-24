import { ROUTES } from "@/constants";
import { getBestTaburl } from "@/server/services/get-tab";
import { GetStaticPropsContext } from "next";

/** This page takes a taburl and returns the highest rated version of that song. */
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

  if (typeof params.id !== "object") {
    return {
      notFound: true,
    };
  }

  const url = params.id.join("/");
  const taburl = await getBestTaburl(url);
  return {
    redirect: {
      destination: ROUTES.TAB(taburl),
    },
  };
};
