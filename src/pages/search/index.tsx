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

  const { data, fetchNextPage, hasNextPage, isLoading, isFetching } =
    trpc.tab.searchTabsExternalFuzzy.useInfiniteQuery(
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

  const results = data?.pages.map((p) => p.items).flat() ?? [];

  const loadPage = () => {
    if (hasNextPage) fetchNextPage();
  };

  useEffect(() => {
    if (q) setSearchText(q);
  }, [q, setSearchText]);

  return (
    <>
      <Head>
        <title>Search Results</title>
      </Head>
      <div className="max-w-[80ch] w-full m-auto">
        <h1 className="text-lg">Search Results</h1>
        <p className="text-gray-400 mb-4 font-extralight">
          Only the highest rated versions of each are shown. This is in testing,
          search is fuzzy but it might be inaccurate.
        </p>
        <>
          <div
            className="mx-auto grid gap-1 w-full"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            }}
          >
            {results.length === 0 ? (
              <></>
            ) : !isLoading ? (
              <>
                {results.map((r, i) => (
                  <>
                    {r.tabs.map((t, i) => (
                      <SearchLink
                        key={i}
                        best
                        tab_url={t.taburl}
                        song_name={r.name}
                        artist_name={r.artist}
                        rating={0}
                        type={t.type}
                        internal={!!t.tabId}
                      />
                    ))}
                  </>
                ))}

                <div className="w-full flex flex-col items-center justify-start">
                  {hasNextPage && (
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
          {isLoading && (
            <div className="flex items-center justify-center w-full">
              <LoadingSpinner className="h-8" />
            </div>
          )}
        </>
      </div>
    </>
  );
}
