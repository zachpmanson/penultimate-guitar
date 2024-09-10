import FilteredSavedTabs from "@/components/home/filteredtabs";
import RecentTabs from "@/components/home/recenttabs";
import SavedTabs from "@/components/home/savedtabs";
import { GuitaleleStyle } from "@/constants";
import useSavedTabs from "@/hooks/useSavedTabs";
import { createContextInner } from "@/server/context";
import { appRouter } from "@/server/routers/_app";
import { useConfigStore } from "@/state/config";
import { useSearchStore } from "@/state/search";
import { createServerSideHelpers } from "@trpc/react-query/server";
import Head from "next/head";
import { useEffect } from "react";
import type { NextPageWithLayout } from "./_app";
import { GetStaticProps } from "next";
import { trpc } from "@/utils/trpc";
import TabLink from "@/components/home/tablink";

const Page: NextPageWithLayout = () => {
  const { data: recentTabs } = trpc.tab.getRecentTabs.useQuery(10);

  const { searchText } = useSearchStore();
  const { mode } = useConfigStore();
  const { savedTabs } = useSavedTabs();

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
      <div className="max-w-xl mx-auto flex flex-col gap-4">
        {isFilter(searchText) ? (
          <FilteredSavedTabs />
        ) : (
          <>
            <SavedTabs />
            <RecentTabs />
            {recentTabs && recentTabs.length > 0 && (
              <details open>
                <summary>
                  <h1 className="text-center text-xl my-4">
                    Other Users Are Playing
                  </h1>
                </summary>
                <div className="flex flex-col gap-1 mt-2">
                  {recentTabs.map((t) => (
                    <TabLink
                      tablink={{
                        ...t,
                        name: t.song.name,
                        artist: t.song.artist,
                      }}
                      recent={true}
                    />
                  ))}
                </div>
              </details>
            )}
          </>
        )}
        {mode === "guitalele" && (
          <p className="text-center">
            <span className={GuitaleleStyle}>Guitalele mode</span> active!
          </p>
        )}
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
