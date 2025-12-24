import { UGApi } from "@/server/ug-interface/ug-api";
import LoadingSpinner from "../loadingspinner";
import PlainButton from "../shared/plainbutton";
import SearchLink from "./searchlink";

export default function ApiSearchResults({
  results,
  isLoading,
  isFetching,
  hasNextPage,
  loadNextPage,
  best = false,
}: {
  results: UGApi.SearchResult[];
  isLoading: boolean;
  isFetching: boolean;
  hasNextPage: boolean;
  loadNextPage: () => void;
  best?: boolean;
}) {
  return (
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
              <SearchLink
                {...r}
                key={i}
                id={r.id}
                routeType="BEST_ID"
                internal
                rating={undefined}
              />
            ))}

            <div className="w-full flex flex-col items-center justify-start">
              {hasNextPage && (
                <PlainButton
                  onClick={loadNextPage}
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
  );
}
