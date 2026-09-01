import { trpc } from "@/utils/trpc";
import { Load } from "../loadingspinner";
import PlainButton from "../shared/plainbutton";
import PlaylistPanel from "./playlistpanel";
import SpotifyButton from "../buttons/spotifybutton";
import { startConnectSpotify } from "@/utils/spotify";

export default function Playlists() {
  const { data, isLoading, isFetching, hasNextPage, fetchNextPage, error } = trpc.user.getPlaylists.useInfiniteQuery(
    {
      pageSize: 20,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 1,
      // No point retrying a missing Spotify link — the server refuses with
      // PRECONDITION_FAILED until the user connects one.
      retry: false,
    }
  );

  const playlists = data?.pages.flatMap((p) => p.items) ?? [];

  // No linked Spotify account — the server refuses with PRECONDITION_FAILED.
  // Surface the Connect affordance instead of an error (same as /profile).
  if (error?.data?.code === "PRECONDITION_FAILED") {
    return (
      <div>
        <div className="flex justify-between items-center pt-4">
          <h1 className="text-left text-xl">Playlists</h1>
          <div className="text-sm text-red-700">ALPHA</div>
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <p>Connect Spotify to list and import your own playlists.</p>
          <SpotifyButton onClick={() => startConnectSpotify().catch(console.error)}>
            Connect your Spotify account
          </SpotifyButton>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <div className="flex justify-between items-center pt-4">
          <h1 className="text-left text-xl">Playlists</h1>
          <div className="text-sm text-red-700">ALPHA</div>
        </div>
        <Load isLoading={isLoading}>
          {playlists.length === 0 ? (
            <div className="flex flex-col gap-1 mt-2">
              <p className="text-center">You have no playlists apparently!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1 mt-2">
              <>
                {playlists.map((p, i) => (
                  <PlaylistPanel playlist={p} key={`${i}-${p.name}`} />
                ))}
                {hasNextPage && (
                  <PlainButton
                    className="w-full text-black dark:text-gray-200 no-underline hover:no-underline active:text-black dark:active:text-white flex justify-center items-center h-12"
                    onClick={() => fetchNextPage()}
                    isLoading={isFetching}
                  >
                    Load more
                  </PlainButton>
                )}
              </>
            </div>
          )}
        </Load>
      </div>
    </div>
  );
}
