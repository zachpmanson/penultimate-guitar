import SpotifyButton from "@/components/buttons/spotifybutton";
import ImportPlaylistDialog from "@/components/dialog/importplaylistdialog";
import LoadingSpinner from "@/components/loadingspinner";
import PlainButton from "@/components/shared/plainbutton";
import { useGlobal } from "@/contexts/Global/context";
import { authOptions } from "@/server/auth";
import { useSearchStore } from "@/state/search";
import { trpc } from "@/utils/trpc";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect, useState } from "react";

export default function Profile() {
  const session = useSession();

  // const [playlist, setPlaylist] = useState<Playlist>();

  const [playlistId, setPlaylistId] = useState<string>();
  const { data: playlist, refetch } = trpc.spotify.getPlaylist.useQuery(
    { playlistId: playlistId ?? "" },
    {
      enabled: !!playlistId,
    }
  );
  const [isImportOpen, setIsImportOpen] = useState(false);
  const { setPlaylists } = useGlobal();
  const { searchText } = useSearchStore();

  const { data, isFetching, isLoading, hasNextPage, fetchNextPage } =
    trpc.user.getPlaylists.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialCursor: 1,
      }
    );

  const pullPlaylist = (url: string) => {
    console.log("pulling playlist", url);
    const matches = url.match(
      /https:\/\/open\.spotify\.com\/playlist\/(?<id>[0-9A-Za-z]+).*/
    );
    const playlistId = matches?.groups?.id!;
    setPlaylistId(playlistId);
    // processPlaylist(playlistId).then((playlist) => {
    //   setPlaylist(playlist);
    //   setIsImportOpen(true);
    //   setPlaylists((o) => {
    //     let n = { ...o };
    //     if (playlistId) n[playlist.name] = playlistId;
    //     return n;
    //   });
    // });
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

  return (
    <>
      <Head>
        <title>Profile</title>
      </Head>
      <div className="max-w-[100ch] mx-auto my-4 flex flex-col gap-4">
        <div className="flex justify-between">
          <div>
            <div className="font-medium  text-2xl">
              {session.data?.user?.name}
            </div>
            <div>{session.data?.user?.email}</div>
          </div>
          <div>
            <SpotifyButton onClick={() => signOut()}>Sign out</SpotifyButton>
          </div>
        </div>
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
                <PlainButton
                  onClick={() => pullPlaylist(playlist.external_urls.spotify)}
                  key={i}
                >
                  <div className="flex flex-col justify-between sm:h-32 h-fit min-w-20">
                    <div
                      className="text-lg font-bold overflow-hidden
                    "
                    >
                      {playlist.name}
                    </div>
                    <div className="flex gap-2 justify-between border-gray-200 dark:border-gray-600 w-full border-t-[1px] pt-2">
                      <div className="">
                        {playlist.images?.[1] && (
                          <img
                            src={playlist.images[1].url}
                            alt="Playlist image"
                            className="rounded-md h-12 w-12"
                          />
                        )}
                      </div>
                      <div className="flex flex-col my-auto text-right">
                        <div className="text-sm">
                          {playlist.tracks.total} tracks
                        </div>
                        <div className="text-xs">
                          {playlist.owner.display_name}
                        </div>
                      </div>
                    </div>
                  </div>
                </PlainButton>
              ))}
          {hasNextPage && (
            <PlainButton onClick={fetchNextPage} disabled={isFetching}>
              <div className="w-full h-full flex items-center justify-center sm:h-32">
                {isFetching ? <LoadingSpinner className="h-8" /> : "Load more"}
              </div>
            </PlainButton>
          )}
        </div>
        {isLoading && (
          <div className="w-full flex items-center justify-center">
            <LoadingSpinner className="h-8" />
          </div>
        )}
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
