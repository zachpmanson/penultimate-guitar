import SpotifyButton from "@/components/buttons/spotifybutton";
import ImportPlaylistDialog from "@/components/dialog/importplaylistdialog";
import LoadingSpinner from "@/components/loadingspinner";
import PlainButton from "@/components/shared/plainbutton";
import { useGlobal } from "@/contexts/Global/context";
import { authOptions } from "@/lib/auth";
import { processPlaylist } from "@/lib/processPlaylist";
import { Playlist } from "@/models/models";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Profile({ jwt }: { jwt: any }) {
  const token = JSON.parse(jwt);

  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>();
  const [page, setPage] = useState(0);
  const [maxItems, setMaxItems] = useState<number>();

  const [userId, setUserId] = useState<string>(
    token.account?.providerAccountId
  );

  const [playlist, setPlaylist] = useState<Playlist>();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const { setPlaylists } = useGlobal();

  const session = useSession();

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    console.log({
      userId: userId,
      page: page,
    });
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
    setItems((prevItems) => [...prevItems, ...data.items]);
    setIsLoading(false);
  };

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [page, userId]);

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

  return (
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
        {items?.map((playlist) => (
          <PlainButton
            onClick={() => pullPlaylist(playlist.external_urls.spotify)}
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
          setIsOpen={setIsImportOpen}
        />
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  let jwt = (await getToken(context)) as any;

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: { jwt: JSON.stringify(jwt) },
  };
};
