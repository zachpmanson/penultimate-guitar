import { ROUTES } from "@/constants";
import { getHighestRatedTabs } from "@/server/services/get-tab";
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

  if (typeof params.id !== "object") {
    return {
      notFound: true,
    };
  }

  const url = params.id.join("/");
  const taburl = (await getHighestRatedTabs(url))[0].taburl;
  return {
    redirect: {
      destination: ROUTES.TAB(taburl),
    },
  };
};
