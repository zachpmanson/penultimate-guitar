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
import Playlists from "@/components/home/playlists";
import { useSession } from "next-auth/react";

const Page: NextPageWithLayout = () => {
  const { data: recentTabs } = trpc.tab.getRecentTabs.useQuery(10);
  const session = useSession();

  const { searchText } = useSearchStore();
  const { mode } = useConfigStore();
  const { flatTabs } = useSavedTabs();
  const allSaved = flatTabs;

  const isFilter = (text: string) => {
    if (flatTabs.length === 0) return false;
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
      <div className="mx-auto max-w-[150ch] flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 justify-center">
          {isFilter(searchText) ? (
            <>
              <div className="max-w-[50ch] flex-1">
                <FilteredSavedTabs />
              </div>
            </>
          ) : (
            <>
              <div className="min-w-80 flex-1">
                <SavedTabs />
              </div>

              {session.status === "authenticated" && (
                <div className="min-w-80 flex-1">
                  <Playlists />
                </div>
              )}
              <div className="flex-1 min-w-80 ">
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
  });

  await helpers.tab.getRecentTabs.prefetch(10);

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
    revalidate: 60,
  };
};
