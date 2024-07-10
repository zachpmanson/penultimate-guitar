import LoadingSpinner from "@/components/loadingspinner";
import SearchLink from "@/components/search/searchlink";
import PlainButton from "@/components/shared/plainbutton";
import { SearchResult } from "@/models/models";
import { useSearchStore } from "@/state/search";
import { trpc } from "@/utils/trpc";
import Head from "next/head";
import { useQueryState } from "nuqs";
import { useEffect } from "react";

function collapseResults(results: SearchResult[]) {
  let colRes: SearchResult[] = [];
  for (let r of results) {
    const existing = colRes.findIndex(
      (c) =>
        c.song_name === r.song_name &&
        c.artist_name === r.artist_name &&
        c.type === r.type
    );
    if (existing !== -1) {
      if (r.rating > colRes[existing].rating) {
        colRes[existing] = r;
      }
    } else {
      colRes.push(r);
    }
  }
  return colRes;
}

export default function Search() {
  const [q] = useQueryState("q");
  const { setSearchText } = useSearchStore();

  const { fetchNextPage, hasNextPage, data, isFetching, isLoading } =
    trpc.tab.searchTabs.useInfiniteQuery(
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
    fetchNextPage();
  };

  const allItems = data
    ? collapseResults(data.pages.map((p) => p.items).flat())
    : [];

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
        <div
          className="mx-auto grid gap-1 w-full"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          }}
        >
          {allItems.length === 0 ? (
            <></>
          ) : data && !isLoading ? (
            <>
              {allItems.map((r, i) => (
                <SearchLink {...r} key={i} />
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
      </div>
    </>
  );
}
