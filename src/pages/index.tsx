import RecentTabs from "@/components/home/recenttabs";
import SavedTabs from "@/components/home/savedtabs";
import Head from "next/head";
import type { NextPageWithLayout } from "./_app";

const Page: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Penultimate Guitar</title>
      </Head>
      <div className="max-w-xl mx-auto flex flex-col gap-2">
        <SavedTabs />
        <RecentTabs />
      </div>
    </>
  );
};

export default Page;
