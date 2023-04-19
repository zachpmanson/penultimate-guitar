import FilteredSavedTabs from "@/components/home/filteredtabs";
import RecentTabs from "@/components/home/recenttabs";
import SavedTabs from "@/components/home/savedtabs";
import { useGlobal } from "@/contexts/Global/context";
import Head from "next/head";
import type { NextPageWithLayout } from "./_app";

const Page: NextPageWithLayout = () => {
  const { searchText, setSearchText } = useGlobal();

  const isFilter = (text: string) => {
    if (text.trim() === "") return false;
    if (text.length < 3) return false;
    try {
      return !new URL(text);
    } catch (e) {
      return true;
    }
  };
  console.log(isFilter(searchText));

  return (
    <>
      <Head>
        <title>Penultimate Guitar</title>
      </Head>
      <div className="max-w-xl mx-auto flex flex-col gap-2">
        {isFilter(searchText) ? (
          <FilteredSavedTabs />
        ) : (
          <>
            <SavedTabs />
            <RecentTabs />
          </>
        )}
      </div>
    </>
  );
};

export default Page;
