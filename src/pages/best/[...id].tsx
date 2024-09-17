import { getHighestRatedTab } from "@/server/ug-interface/get-tab";
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

  if (typeof params.id !== "object") {
    return {
      notFound: true,
    };
  }

  const url = params.id.join("/");
  return {
    redirect: {
      destination: "/tab/" + (await getHighestRatedTab(url))[0].taburl,
    },
  };
};
