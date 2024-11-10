import SearchResults from "@/components/search/searchresults";
import {
  ApiSearchResult,
  SearchResult,
  SearchTabType,
  TAB_TYPES,
} from "@/models/models";
import { useSearchStore } from "@/state/search";
import { trpc } from "@/utils/trpc";
import Head from "next/head";
import Link from "next/link";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
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

// function dedupSearchResults(res: ApiSearchResult[]) {
// //   let o = new Map<string, ApiSearchResult>();

// //   for (let next of res) {
// //     const existing = o.get(next.tab_url);
// //     if (existing) {
// //       o.set(next.tab_url, {
// //         ...existing,
// //         rating: !next.internal ? next.rating : existing.rating, // internal rating might be out of date
// //         internal: existing.internal || next.internal,
// //       });
// //     } else {
// //       o.set(next.tab_url, next);
// //     }
// //   }
// //   return Array.from(o.values());
// // }

// can replace with /best/
/** Merge versions of the same tab, prefer higher rating */
function preferHigherRatings(results: ApiSearchResult[]) {
  let colRes: ApiSearchResult[] = [];
  for (let r of results) {
    const existing = colRes.findIndex(
      (c) =>
        c.song_name === r.song_name &&
        c.artist_name === r.artist_name &&
        c.type === r.type
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
      // search_type: "title",
      // page_size: 10,
      page_size: 10,
      type: type,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 1,
      enabled: !!q,
    }
  );

  // const {
  //   data: dataInternal,
  //   fetchNextPage: fetchNextPageInternal,
  //   hasNextPage: hasNextPageInternal,
  //   isLoading: isLoadingInternal,
  //   isFetching: isFetchingInternal,
  // } = trpc.tab.searchTabsInternal.useInfiniteQuery(
  //   {
  //     value: q ?? "",
  //     search_type: "title",
  //   },
  //   {
  //     getNextPageParam: (lastPage) => lastPage.nextCursor,
  //     initialCursor: 1,
  //     enabled: !!q,
  //   }
  // );

  const loadPage = () => {
    if (hasNextPageExternal) fetchNextPageExternal();
  };

  // const allItemsInternal = dataInternal
  //   ? dataInternal.pages
  //       .map((p) => p.items)
  //       .flat()
  //       .map((r, i) => ({
  //         id: i,
  //         song_id: r.songId,
  //         song_name: r.song.name,
  //         artist_name: r.song.artist,
  //         type: r.type,
  //         version: r.version,
  //         rating: r.rating,
  //         date: r.timestamp ?? "",
  //         tab_url: r.taburl,
  //         internal: true,
  //         ...searchResultPlaceholder,
  //       }))
  //   : [];

  // const allItemsExternal = dataExternal
  //   ? dataExternal.pages.map((p) => p.items).flat()
  //   : [];

  const maxPageNums = Math.max(dataExternal?.pages.length ?? 0);

  let resultsInPageOrder: ApiSearchResult[] = [];
  for (let i = 0; i < maxPageNums; i++) {
    // if (dataInternal && dataInternal.pages.length > i) {
    //   resultsInPageOrder = resultsInPageOrder.concat(
    //     dataInternal.pages[i].items.map((r) => ({
    //       ...searchResultPlaceholder,
    //       id: i,
    //       song_id: r.songId,
    //       song_name: r.song.name,
    //       artist_name: r.song.artist,
    //       type: r.type,
    //       version: r.version,
    //       rating: r.rating,
    //       date: r.timestamp ?? "",
    //       tab_url: r.taburl,
    //       internal: true,
    //     }))
    //   );
    // }

    if (dataExternal && dataExternal.pages.length > i) {
      resultsInPageOrder = resultsInPageOrder.concat(
        dataExternal.pages[i].items
      );
    }
  }

  const mergedResults = preferHigherRatings(resultsInPageOrder);

  useEffect(() => {
    if (q) {
      setSearchText(q);
    }
  }, [q, setSearchText]);

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
          >
            <option value="all">All</option>
            <option value="tabs">Tabs</option>
            <option value="chords">Chords</option>
            <option value="ukulele">Ukulele</option>
            <option value="bass">Bass</option>
          </select>
        </div>{" "}
        <p className="text-gray-400 mb-4 font-extralight">
          Only the highest rated versions of each are shown.
        </p>
        {/* {allItemsInternal.length} + {allItemsExternal.length} ={" "}
        {mergedResults.length} */}
        {mergedResults.map((r) => (
          <>
            <Link href={`/original/${r.id}`} key={r.id}>
              {r.song_name} - {r.artist_name}
            </Link>
            <br />
          </>
        ))}
        {/* <SearchResults
          results={mergedResults}
          isLoading={isLoadingExternal}
          isFetching={isFetchingExternal}
          hasNextPage={hasNextPageExternal}
          loadNextPage={loadPage}
        /> */}
        <pre>{JSON.stringify(dataExternal, null, 2)}</pre>
      </div>
    </>
  );
}
