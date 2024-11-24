import ApiSearchResults from "@/components/search/apisearchresults";
import { SearchTabType, TAB_TYPES } from "@/models/models";
import { UGApi } from "@/server/ug-interface/ug-api";
import { useSearchStore } from "@/state/search";
import { trpc } from "@/utils/trpc";
import Head from "next/head";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useEffect } from "react";

function dedupSearchResults(res: UGApi.SearchResult[]) {
  let o = new Map<string, UGApi.SearchResult>();

  for (let next of res) {
    const id = String(next.song_id);
    const existing = o.get(id);
    if (existing) {
      o.set(id, {
        ...existing,
      });
    } else {
      o.set(id, next);
    }
  }
  return Array.from(o.values());
}

export default function Search() {
  const [q] = useQueryState("q");
  const { setSearchText } = useSearchStore();
  const [type, setTabType] = useQueryState(
    "type",
    parseAsStringLiteral(TAB_TYPES).withDefault("all")
  );

  const {
    fetchNextPage: fetchNextPageExternal,
    hasNextPage: hasNextPageExternal,
    data: dataExternal,
    isFetching: isFetchingExternal,
    isLoading: isLoadingExternal,
  } = trpc.tab.search.useInfiniteQuery(
    {
      value: q ?? "",
      type: type,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 1,
      enabled: !!q,
    }
  );

  const loadPage = () => {
    if (hasNextPageExternal) fetchNextPageExternal();
  };

  const maxPageNums = Math.max(dataExternal?.pages.length ?? 0);

  let resultsInPageOrder: UGApi.SearchResult[] = [];
  for (let i = 0; i < maxPageNums; i++) {
    if (dataExternal && dataExternal.pages.length > i) {
      resultsInPageOrder = resultsInPageOrder.concat(
        dataExternal.pages[i].items
      );
    }
  }

  useEffect(() => {
    if (q) {
      setSearchText(q);
    }
  }, [q, setSearchText]);

  const mergedResults = dedupSearchResults(resultsInPageOrder);

  return (
    <>
      <Head>
        <title>Search</title>
      </Head>
      <div className="max-w-[80ch] w-full m-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-lg">Search Results</h1>
          <select
            className="p-2 rounded"
            onChange={(e) => setTabType(e.target.value as SearchTabType)}
            value={type}
          >
            <option value="all">All</option>
            <option value="tabs">Tabs</option>
            <option value="chords">Chords</option>
            <option value="ukulele">Ukulele</option>
            <option value="bass">Bass</option>
          </select>
        </div>
        <p className="text-gray-400 mb-4 font-extralight">
          Only the highest rated versions of each are shown.
        </p>
        <ApiSearchResults
          results={mergedResults}
          isLoading={isLoadingExternal}
          isFetching={isFetchingExternal}
          hasNextPage={hasNextPageExternal}
          loadNextPage={loadPage}
        />
        {/* <pre>{JSON.stringify(dataExternal, null, 2)}</pre> */}
      </div>
    </>
  );
}
