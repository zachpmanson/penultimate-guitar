import SpotifyButton from "@/components/buttons/spotifybutton";
import ImportPlaylistDialog from "@/components/dialog/importplaylistdialog";
import LoadingSpinner from "@/components/loadingspinner";
import PlainButton from "@/components/shared/plainbutton";
import { useGlobal } from "@/contexts/Global/context";
import { authOptions } from "@/lib/auth";
import { processPlaylist } from "@/lib/processPlaylist";
import { Playlist } from "@/models/models";
import { GetServerSideProps } from "next";
import { Session, getServerSession } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Profile() {
  const router = useRouter();
  const session = useSession();

  const [items, setItems] = useState<any[]>([]);
  const [visibleItems, setVisibleItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>();
  const [page, setPage] = useState(0);
  const [maxItems, setMaxItems] = useState<number>();

  const [userId, setUserId] = useState<string>(
    (session?.data as Session & { token: any })?.token.account
      ?.providerAccountId
  );

  const [playlist, setPlaylist] = useState<Playlist>();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const { setPlaylists, searchText } = useGlobal();

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    const data = await fetch("/api/userPlaylists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        page: page,
      }),
    })
      .then((res) => res.json())
      .catch((err) => setError(err));

    setMaxItems(data.total);
    if (data.items?.length > 0) {
      setItems((prevItems) => [...prevItems, ...data.items]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    setUserId(
      (session?.data as Session & { token: any })?.token.account
        ?.providerAccountId
    );
  }, [session]);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, page]);

  const pullPlaylist = (url: string) => {
    console.log("pulling playlist", url);
    const matches = url.match(
      /https:\/\/open\.spotify\.com\/playlist\/(?<id>[0-9A-Za-z]+).*/
    );
    const playlistId = matches?.groups?.id!;
    processPlaylist(playlistId).then((playlist) => {
      setPlaylist(playlist);
      setIsImportOpen(true);
      setPlaylists((o) => {
        let n = { ...o };
        if (playlistId) n[playlist.name] = playlistId;
        return n;
      });
    });
  };

  useEffect(() => {
    let searchTextLower = searchText.toLowerCase();
    setVisibleItems((o) =>
      items.filter((p) => p.name.toLowerCase().includes(searchTextLower))
    );
  }, [searchText, items]);

  useEffect(() => {
    if (visibleItems.length === 0 && maxItems && items.length < maxItems) {
      setPage((i) => (i ?? 0) + 1);
    }
  }, [searchText, items]);

  return (
    <>
      <Head>
        <title>Profile</title>
      </Head>
      <div className="max-w-lg mx-auto my-4 flex flex-col gap-4">
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
        <div className="flex flex-col gap-4">
          {visibleItems?.map((playlist, i) => (
            <PlainButton
              onClick={() => pullPlaylist(playlist.external_urls.spotify)}
              key={i}
            >
              <div className="flex gap-2 justify-between align-top">
                <div>
                  <div className="text-lg font-bold">{playlist.name}</div>

                  <div className="flex gap-2 align-middle justify-between">
                    <div className="flex flex-col my-auto text-left">
                      <div className="text-sm">
                        {playlist.tracks.total} tracks
                      </div>
                      <div className="text-xs">
                        Created by {playlist.owner.display_name}
                      </div>
                    </div>
                  </div>
                </div>
                {playlist.images[1] && (
                  <Image
                    src={playlist.images[1].url}
                    alt="Playlist image"
                    width={60}
                    height={60}
                    className="rounded-md"
                  />
                )}
              </div>
            </PlainButton>
          ))}
        </div>
        {!isLoading && maxItems && items.length < maxItems && (
          <div className="m-auto w-fit">
            <PlainButton onClick={() => setPage((i) => (i ?? 0) + 1)}>
              <div className="flex items-center justify-center">Load more</div>
            </PlainButton>
          </div>
        )}
        {isLoading && <LoadingSpinner />}
        {isImportOpen && playlist && (
          <ImportPlaylistDialog
            playlist={playlist}
            isOpen={isImportOpen}
            setIsOpen={(isOpen) => {
              setIsImportOpen(isImportOpen);
              router.push("/");
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
