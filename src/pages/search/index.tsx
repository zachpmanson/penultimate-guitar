import LoadingSpinner from "@/components/loadingspinner";
import PlainButton from "@/components/shared/plainbutton";
import SearchLink from "@/components/search/searchlink";
import { SearchResult } from "@/models/models";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { trpc } from "@/utils/trpc";

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

export default function Tab() {
  const router = useRouter();
  const { q } = router.query;
  let value: string;
  if (q === undefined) {
    value = "";
  } else if (typeof q !== "string") {
    value = q[0];
  } else {
    value = q;
  }

  const [pageNum, setPageNum] = useState(1);
  const [searchString, setSearchString] = useState(value);
  const [canLoadMore, setCanLoadMore] = useState(true);

  const {
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,

    data,
    isFetching,
    isLoading,
  } = trpc.tab.searchTabs.useInfiniteQuery(
    {
      value: searchString,
      search_type: "title",
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 1,
    }
  );

  // useEffect(() => {
  //   setPageNum(1);
  //   return () => setResults([]);
  // }, [searchString]);

  useEffect(() => {
    setSearchString(value);
  }, [value]);

  const loadPage = () => {
    setPageNum((old) => old + 1);
    fetchNextPage();
  };

  const allItems = data
    ? collapseResults(data.pages.map((p) => p.items).flat())
    : [];

  return (
    <>
      <Head>
        <title>Search</title>
      </Head>
      <h1 className="text-center text-2xl">Search Results</h1>
      <p className="text-center text-gray-400 mb-4 font-extralight">
        Only the highest rated versions of each are shown.
      </p>
      <div className="max-w-xl mx-auto flex flex-col gap-2">
        {allItems.length === 0 ? (
          <></>
        ) : data && !isLoading ? (
          <>
            {allItems.map((r, i) => (
              <SearchLink {...r} key={i} />
            ))}
            {
              <div className="m-auto w-fit">
                {hasNextPage && !isFetching && (
                  <PlainButton onClick={loadPage}>
                    <div className="flex items-center justify-center">
                      Load More
                    </div>
                  </PlainButton>
                )}
              </div>
            }
          </>
        ) : (
          <p className="text-center">No results found</p>
        )}
        {isFetching && <LoadingSpinner />}
      </div>
    </>
  );
}
