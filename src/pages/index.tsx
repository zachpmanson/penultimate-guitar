import FilteredSavedTabs from "@/components/home/filteredtabs";
import RecentTabs from "@/components/home/recenttabs";
import SavedTabs from "@/components/home/savedtabs";
import { GuitaleleStyle } from "@/constants";
import useSavedTabs from "@/hooks/useSavedTabs";
import { useConfigStore } from "@/state/config";
import { useSearchStore } from "@/state/search";
import Head from "next/head";
import type { NextPageWithLayout } from "./_app";
import { useEffect } from "react";

const Page: NextPageWithLayout = () => {
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
