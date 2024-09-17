import FilteredSavedTabs from "@/components/home/filteredtabs";
import RecentTabs from "@/components/home/recenttabs";
import SavedTabs from "@/components/home/savedtabs";
import TablinkList from "@/components/home/tablinklist";
import { GuitaleleStyle } from "@/constants";
import useSavedTabs from "@/hooks/useSavedTabs";
import { createContextInner } from "@/server/context";
import { appRouter } from "@/server/routers/_app";
import { useConfigStore } from "@/state/config";
import { useSearchStore } from "@/state/search";
import { trpc } from "@/utils/trpc";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { GetStaticProps } from "next";
import Head from "next/head";
import { useEffect } from "react";
import type { NextPageWithLayout } from "./_app";

const Page: NextPageWithLayout = () => {
  const { data: recentTabs } = trpc.tab.getRecentTabs.useQuery(10);

  const { searchText } = useSearchStore();
  const { mode } = useConfigStore();
  const { savedTabs } = useSavedTabs();
  const allSaved = savedTabs.flatMap((f) => f.tabs);

  const isFilter = (text: string) => {
    if (savedTabs.length === 0) return false;
    if (text.trim() === "") return false;
    if (text.length < 3) return false;
    try {
      return !new URL(text);
    } catch (e) {
      return true;
    }
  };

  const { setSearchText } = useSearchStore();

  useEffect(() => {
    setSearchText("");
  }, [setSearchText]);

  return (
    <>
      <Head>
        <title>Penultimate Guitar</title>
      </Head>
      <div className="mx-auto max-w-[100ch] flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 justify-center">
          {isFilter(searchText) ? (
            <FilteredSavedTabs />
          ) : (
            <>
              {allSaved.length > 5 && (
                <div className="min-w-80 max-w-[50ch] flex-1">
                  <SavedTabs />
                </div>
              )}

              <div className="min-w-80 max-w-[50ch] flex-1">
                {allSaved.length <= 5 && <SavedTabs />}
                <RecentTabs />
                {recentTabs && recentTabs.length > 0 && (
                  <TablinkList
                    title="Other Users Are Playing"
                    tablinks={recentTabs.map((t) => ({
                      ...t,
                      name: t.song.name,
                      artist: t.song.artist,
                    }))}
                  />
                )}
              </div>
              {/* <div className="min-w-80 flex-1"></div> */}
            </>
          )}
          {mode === "guitalele" && (
            <p className="text-center">
              <span className={GuitaleleStyle}>Guitalele mode</span> active!
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default Page;

export const getStaticProps: GetStaticProps = async () => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: await createContextInner(),
    // transformer: superjson, // optional - adds superjson serialization
  });

  await helpers.tab.getRecentTabs.prefetch(10);

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
    revalidate: 60,
  };
};
