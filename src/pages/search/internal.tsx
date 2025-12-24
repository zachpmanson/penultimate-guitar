import SearchResults from "@/components/search/searchresults";
import { SearchResult } from "@/models/models";
import { useSearchStore } from "@/state/search";
import { trpc } from "@/utils/trpc";
import Head from "next/head";
import { useQueryState } from "nuqs";
import { useEffect } from "react";

const searchResultPlaceholder = {
  artist_id: 0,
  part: "r.part",
  votes: 0,
  status: "r.status",
  preset_id: 0,
  tab_access_type: "r.tabAccessType",
  tp_version: 0,
  tonality_name: "r.tonalityName",
  version_description: "r.versionDescription",
  verified: 0,
  recording: "r.recording",
  artist_url: "r.artistUrl",
};

/** Merge versions of the same tab, prefer higher rating */
function collapseResults(results: SearchResult[]) {
  let colRes: SearchResult[] = [];
  for (let r of results) {
    const existing = colRes.findIndex(
      (c) => c.song_name === r.song_name && c.artist_name === r.artist_name && c.type === r.type
    );
    if (existing === -1) {
      colRes.push(r);
    } else {
      if (r.rating > colRes[existing].rating) {
        colRes[existing] = r;
      }
    }
  }
  return colRes;
}

export default function Search() {
  const [q] = useQueryState("q");
  const { setSearchText } = useSearchStore();

  const {
    data: dataInternal,
    fetchNextPage: fetchNextPageInternal,
    hasNextPage: hasNextPageInternal,
    isLoading: isLoadingInternal,
    isFetching: isFetchingInternal,
  } = trpc.tab.searchTabsInternalFuzzy.useInfiniteQuery(
    {
      value: q ?? "",
      search_type: "title",
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 1,
      enabled: !!q,
    }
  );

  const loadPage = () => {
    if (hasNextPageInternal) fetchNextPageInternal();
  };

  const allItemsInternal = dataInternal
    ? dataInternal.pages
        .map((p) => p.items)
        .flat()
        .map((r, i) => ({
          id: i,
          song_id: r.songId,
          song_name: r.song.name,
          artist_name: r.song.artist,
          type: r.type,
          version: r.version,
          rating: r.rating,
          date: r.timestamp ?? "",
          tab_url: r.taburl,
          internal: true,
          ...searchResultPlaceholder,
        }))
    : [];

  const mergedResults = collapseResults(allItemsInternal);

  useEffect(() => {
    if (q) {
      setSearchText(q);
    }
  }, [q, setSearchText]);

  return (
    <>
      <Head>
        <title>Search Internal Results</title>
      </Head>
      <div className="max-w-[80ch] w-full m-auto">
        <h1 className="text-lg">Search Internal Results</h1>
        <p className="text-gray-400 mb-4 font-extralight">
          Only the highest rated versions of each are shown. This is in testing, search is fuzzy but it might be
          inaccurate.
        </p>
        <SearchResults
          results={mergedResults}
          isLoading={isLoadingInternal}
          isFetching={isFetchingInternal}
          hasNextPage={hasNextPageInternal}
          loadNextPage={loadPage}
        />
      </div>
    </>
  );
}
