import LoadingSpinner from "@/components/loadingspinner";
import SearchLink from "@/components/search/searchlink";
import PlainButton from "@/components/shared/plainbutton";
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

function mergeInternalExternal(
  internal: SearchResult[],
  external: SearchResult[]
) {
  let o = Object.fromEntries(internal.map((e) => [e.tab_url, e]));

  for (let e of external) {
    if (o[e.tab_url]) {
      o[e.tab_url].rating = e.rating; // internal rating might be out of date
    } else {
      o[e.tab_url] = e;
    }
  }
  return Object.values(o);
}

/** Merge versions of the same tab, prefer higher rating */
function collapseResults(results: SearchResult[]) {
  let colRes: SearchResult[] = [];
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

  const {
    fetchNextPage: fetchNextPageExternal,
    hasNextPage: hasNextPageExternal,
    data,
    isFetching,
    isLoading,
  } = trpc.tab.searchTabsExternal.useInfiniteQuery(
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

  const {
    data: searchTabsInternal,
    fetchNextPage: fetchNextPageInternal,
    hasNextPage: hasNextPageInternal,
  } = trpc.tab.searchTabsInternal.useInfiniteQuery(
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
    if (hasNextPageExternal) fetchNextPageExternal();
  };

  const allItemsExternal = data ? data.pages.map((p) => p.items).flat() : [];

  const allItemsInternal = searchTabsInternal
    ? searchTabsInternal.pages
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

  const mergedResults = collapseResults(
    mergeInternalExternal(allItemsInternal, allItemsExternal)
  );

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
        <h1 className="text-lg">Search Results</h1>
        <p className="text-gray-400 mb-4 font-extralight">
          Only the highest rated versions of each are shown.
        </p>
        {allItemsInternal.length} + {allItemsExternal.length} ={" "}
        {mergedResults.length}
        <div
          className="mx-auto grid gap-1 w-full"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          }}
        >
          {mergedResults.length === 0 ? (
            <></>
          ) : data && !isLoading ? (
            <>
              {mergedResults.map((r, i) => (
                <SearchLink {...r} key={i} />
              ))}

              <div className="w-full flex flex-col items-center justify-start">
                {(hasNextPageExternal || hasNextPageInternal) && (
                  <PlainButton
                    onClick={loadPage}
                    className="flex-grow w-full flex items-center justify-center"
                  >
                    {isFetching ? (
                      <LoadingSpinner className="h-8" />
                    ) : (
                      <div className="w-fit h-8 flex items-center justify-center">
                        Load More
                      </div>
                    )}
                  </PlainButton>
                )}
              </div>
            </>
          ) : (
            <p className="text-center">No results found</p>
          )}
        </div>
        <pre>
          {allItemsInternal.map((i) => i.tab_url).join("\n")}
          <hr />
          {allItemsExternal.map((i) => i.tab_url).join("\n")}
        </pre>
        {isLoading && (
          <div className="flex items-center justify-center w-full">
            <LoadingSpinner className="h-8" />
          </div>
        )}
      </div>
    </>
  );
}
