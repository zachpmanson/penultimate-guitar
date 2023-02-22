import PinnedTabs from "@/components/pinnedtabs";
import RecentTabs from "@/components/recenttabs";
import Head from "next/head";
import Link from "next/link";
import type { NextPageWithLayout } from "./_app";

const Page: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Penultimate Guitar</title>
      </Head>
      <div className="max-w-xl mx-auto">
        <PinnedTabs />
        <RecentTabs />
      </div>
      <div className="text-center">
        <Link href="/directory">Song Directory</Link>
      </div>
    </>
  );
};

export default Page;
