import LoadingSpinner from "@/components/loadingspinner";
import SearchLink from "@/components/search/searchlink";
import ToolbarButton from "@/components/tab/toolbarbutton";
import { SearchResult } from "@/models";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Tab() {
  const router = useRouter();
  const { query } = router.query;
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageNum, setPageNum] = useState(1);

  const collapseResults = (results: SearchResult[]) => {
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
  };

  useEffect(() => {
    let value: string;
    let search_type: string = "title";
    if (query === undefined) {
      value = "";
    } else if (typeof query !== "string") {
      value = query[0];
    } else {
      value = query;
    }
    setIsLoading(true);
    fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        value: value,
        search_type: search_type,
        page: pageNum,
      }),
    })
      .then((res) => res.json())
      .then((res: SearchResult[]) => {
        setResults((old) => collapseResults([...old, ...res]));
        setIsLoading(false);
      });
  }, [query, pageNum]);

  const loadPage = () => {
    setPageNum((old) => old + 1);
  };
  const cantLoadMore = false;
  return (
    <>
      <Head>
        <title>{`Search`}</title>
      </Head>
      <h1 className="text-center text-2xl my-4">Search Results</h1>
      {results.length === 0 ? (
        <></>
      ) : results.length > 0 ? (
        <>
          {results.map((r, i) => (
            <SearchLink key={i} {...r} />
          ))}
          {isLoading || (
            <div className="m-auto w-fit">
              <button
                onClick={loadPage}
                disabled={cantLoadMore}
                className={`flex items-center justify-center text-md text-lg border-grey-500 border-2 rounded-xl transition ease-in-out bg-white py-2 px-4 ${
                  cantLoadMore ? "text-slate-400" : "hover:shadow-md"
                }`}
              >
                Load more
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-center">No results found</p>
      )}
      {isLoading && <LoadingSpinner />}
    </>
  );
}
