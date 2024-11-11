import { UGApi } from "@/server/ug-interface/ug-api";
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
  if (typeof params.id !== "string") {
    return {
      notFound: true,
    };
  }

  const originalId = params.id;

  const tab = await UGApi.getTab({
    tab_id: parseInt(originalId),
  });
  console.log(tab);
  if (!tab) {
    return {
      notFound: true,
    };
  }

  return {
    redirect: {
      destination:
        "/best/" +
        tab.urlWeb.replace("https://tabs.ultimate-guitar.com/tab/", ""),
    },
  };
};
