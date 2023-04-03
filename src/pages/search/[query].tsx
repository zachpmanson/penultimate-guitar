import LoadingSpinner from "@/components/loadingspinner";
import SearchLink from "@/components/search/searchlink";
import { SearchResult } from "@/models";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Tab() {
  const router = useRouter();
  const { query } = router.query;
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
      body: JSON.stringify({ value: value, search_type: search_type }),
    })
      .then((res) => res.json())
      .then((res: SearchResult[]) => {
        setResults(res);
        setIsLoading(false);
      });
  }, [query]);

  return (
    <>
      <Head>
        <title>{`Search`}</title>
      </Head>
      <h1 className="text-center text-2xl my-4">Search Results</h1>
      {isLoading ? (
        <LoadingSpinner />
      ) : results.length > 0 ? (
        results.map((r, i) => <SearchLink key={i} {...r} />)
      ) : (
        <p className="text-center">No results found</p>
      )}
    </>
  );
}
