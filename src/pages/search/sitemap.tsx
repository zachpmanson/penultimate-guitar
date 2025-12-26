import LoadingSpinner from "@/components/loadingspinner";
import SongItem from "@/components/search/songitem";
import PlainButton from "@/components/shared/plainbutton";
import { SearchTabType } from "@/models/models";
import { useSearchStore } from "@/state/search";
import { trpc } from "@/utils/trpc";
import Head from "next/head";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";

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

export default function Search() {
  const [q] = useQueryState("q");

  const { setSearchText } = useSearchStore();

  const [tabType, setTabType] = useState<SearchTabType>("all");

  const { data, fetchNextPage, hasNextPage, isLoading, isFetching } = trpc.tab.querySitemap.useInfiniteQuery(
    {
      value: q ?? "",
      search_type: "title",
      tab_type: tabType,
      page_size: 20,
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
        <div className="flex justify-between items-center">
          <h1 className="text-lg">Search Results</h1>
          <select className="p-2 rounded-sm" onChange={(e) => setTabType(e.target.value as SearchTabType)}>
            <option value="all">All</option>
            <option value="tabs">Tabs</option>
            <option value="chords">Chords</option>
            <option value="ukulele">Ukulele</option>
            <option value="bass">Bass</option>
          </select>
        </div>
        <p className="text-gray-400 mb-4 font-extralight">
          Only the highest rated versions of each are shown. This is in testing, search is fuzzy but it might be
          inaccurate.
        </p>
        <div className="flex flex-col gap-2 justify-center items-center">
          <div
            className="mx-auto grid gap-5 w-full"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            }}
          >
            {results.length === 0 ? (
              <></>
            ) : !isLoading ? (
              <>
                {results.map((r, i) => (
                  <SongItem song={r} key={i} />
                ))}
              </>
            ) : (
              <p className="text-center">No results found</p>
            )}
          </div>
          <div className="flex flex-col w-64 items-center justify-start">
            {hasNextPage && (
              <PlainButton onClick={loadPage} className="grow w-full flex items-center justify-center">
                {isFetching ? (
                  <LoadingSpinner className="h-8" />
                ) : (
                  <div className="w-fit h-8 flex items-center justify-center">Load More</div>
                )}
              </PlainButton>
            )}
          </div>
          {isLoading && (
            <div className="flex items-center justify-center w-full">
              <LoadingSpinner className="h-8" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
