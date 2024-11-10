import { getTabFromOriginalId } from "@/server/services/get-taburl-from-originalid";
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
  if (typeof params.id !== "object") {
    return {
      notFound: true,
    };
  }

  const originalId = params.id.join("/");

  const tab = await getTabFromOriginalId(parseInt(originalId));
  if (!tab) {
    return {
      notFound: true,
    };
  }

  return {
    redirect: {
      destination: "/best/" + tab.taburl,
    },
  };
};
