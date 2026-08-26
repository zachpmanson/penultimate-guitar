import SpotifyButton from "@/components/buttons/spotifybutton";
import ImportPlaylistDialog from "@/components/dialog/importplaylistdialog";
import LoadingSpinner from "@/components/loadingspinner";
import PlainButton from "@/components/shared/plainbutton";
import { useGlobal } from "@/contexts/Global/context";
import useUser from "@/hooks/useUser";
import { useSearchStore } from "@/state/search";
import { startConnectSpotify } from "@/utils/spotify";
import { trpc } from "@/utils/trpc";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Profile() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();

  const [playlistId, setPlaylistId] = useState<string>();
  const { data: playlist } = trpc.spotify.getPlaylist.useQuery(
    { playlistId: playlistId ?? "", save: true },
    {
      enabled: !!playlistId,
    }
  );
  const [isImportOpen, setIsImportOpen] = useState(false);
  const { setPlaylists } = useGlobal();

  // Whether this user has a linked Spotify account (drives the connect prompt).
  const account = trpc.user.me.useQuery(undefined, { enabled: !!user });

  const {
    data,
    isFetching,
    hasNextPage,
    fetchNextPage,
    refetch: refetchPlaylists,
  } = trpc.user.getPlaylists.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 1,
      enabled: !!user && !!account.data?.spotifyUserId,
    }
  );

  // Edge identity is required to view this page.
  useEffect(() => {
    if (!userLoading && !user) {
      router.replace("/login");
    }
  }, [userLoading, user, router]);

  const pullPlaylist = (url: string) => {
    const matches = url.match(/https:\/\/open\.spotify\.com\/playlist\/(?<id>[0-9A-Za-z]+).*/);
    const playlistId = matches?.groups?.id!;
    setPlaylistId(playlistId);
  };

  useEffect(() => {
    if (playlistId) {
      setIsImportOpen(true);
    }
  }, [playlistId]);

  useEffect(() => {
    if (playlist) {
      setPlaylists((o) => {
        let n = { ...o };
        if (playlistId) n[playlist.name] = playlistId;
        return n;
      });
    }
  }, [playlist, playlistId, setPlaylists]);

  if (!user) {
    return <LoadingSpinner className="h-8" />;
  }

  const linked = !!account.data?.spotifyUserId;

  return (
    <>
      <Head>
        <title>Profile</title>
      </Head>
      <div className="max-w-[100ch] mx-auto my-4 flex flex-col gap-4">
        <div className="flex justify-between">
          <div className="font-medium text-2xl">signed in as {user}</div>
          <div className="flex gap-2">
            {linked ? (
              <span className="my-auto text-sm">Spotify connected</span>
            ) : (
              <SpotifyButton onClick={() => startConnectSpotify().catch(console.error)}>
                Connect your Spotify account
              </SpotifyButton>
            )}
          </div>
        </div>

        {!linked ? (
          <p>Connect Spotify to list and import your own playlists.</p>
        ) : (
          <>
            Select a playlist to import:
            <div
              className="gap-1 grid"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              }}
            >
              {data &&
                data?.pages
                  .flatMap((p) => p.items)
                  .map((playlist, i) => (
                    <PlainButton onClick={() => pullPlaylist(playlist.external_urls.spotify)} key={i}>
                      <div className="flex flex-col justify-between sm:h-32 h-fit min-w-20">
                        <div className="text-lg font-bold overflow-hidden text-left">{playlist.name}</div>
                        <div className="flex gap-2 justify-between border-gray-200 dark:border-gray-600 w-full border-t pt-2">
                          <div className="">
                            {playlist.images?.[1] && (
                              <img src={playlist.images[1].url} alt="" className="rounded-md h-12 w-12" />
                            )}
                          </div>
                          <div className="flex flex-col my-auto text-right">
                            <div className="text-sm">{playlist.tracks.total} tracks</div>
                            <div className="text-xs">{playlist.owner.display_name}</div>
                          </div>
                        </div>
                      </div>
                    </PlainButton>
                  ))}
              {hasNextPage && (
                <PlainButton onClick={() => fetchNextPage()} disabled={isFetching}>
                  <div className="w-full h-full flex items-center justify-center sm:h-32">
                    {isFetching ? <LoadingSpinner className="h-8" /> : "Load more"}
                  </div>
                </PlainButton>
              )}
            </div>
          </>
        )}
        <div>
          <button
            onClick={() => {
              refetchPlaylists();
            }}
            className="text-sm underline"
          >
            Refresh playlists
          </button>
        </div>
        {isImportOpen && playlist && (
          <ImportPlaylistDialog
            playlist={playlist}
            isOpen={isImportOpen}
            setIsOpen={(isOpen) => {
              setIsImportOpen(isOpen);
            }}
          />
        )}
      </div>
    </>
  );
}