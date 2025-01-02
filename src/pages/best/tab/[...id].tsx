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
  return {
    redirect: {
      destination: "/tab/" + (await getHighestRatedTabs(url))[0].taburl,
    },
  };
};
