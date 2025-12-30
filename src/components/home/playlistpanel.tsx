import { Playlist } from "@/types/spotify";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { useRef, useState } from "react";
import { stripRemasterAnnotations } from "src/utils/title";
import BasePanel from "../shared/basepanel";
import PlainButton from "../shared/plainbutton";
import PanelMenu from "./panelmenu";

export default function PlaylistPanel({ playlist }: { playlist: Playlist }) {
  const [hovering, setHovering] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const divRef = useRef<HTMLDivElement>(null);

  const [isImportOpen, setIsImportOpen] = useState(false);
  const getPlaylist = trpc.spotify.getPlaylistLazy.useMutation();
  const [pulling, setPulling] = useState<string | null>(null);
  // const _d = trpc.spotify.getPlaylist.useInfiniteQuery(
  //   { playlistId: playlist.playlistId ?? "", save: true },
  //   {
  //     enabled: isImportOpen,
  //     getNextPageParam: (lastPage) => lastPage.nextCursor,
  //     initialCursor: 0,
  //   }
  // );

  const importPlaylist = async () => {
    await getPlaylist.mutateAsync({
      playlistId: playlist.id,
    });

    setIsImportOpen(true);
  };

  const scrapeAll = async () => {
    if (!data) return;

    for (let track of data.tracks) {
      setPulling(track.name);
      await fetch(`/track/${track.trackId.split(":").at(-1)}`).catch(() => console.log("Couldn't find track", track));
      await new Promise((r) => setTimeout(r, 2000));
    }

    setPulling(null);
  };

  const { data, isLoading } = trpc.spotify.getPlaylist.useQuery(
    { playlistId: playlist.uri.split(":").at(-1) ?? "", save: false },
    {
      enabled: isOpen,
    }
  );

  return (
    <>
      <BasePanel
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        header={
          <div className="flex justify-between w-full gap-2 items-center">
            <h2 className="text-lg">{playlist.name}</h2>
            {playlist.images?.at(-1)?.url && (
              <Link href={`https://open.spotify.com/playlist/${playlist.id}`} target="_blank" prefetch={false}>
                <img src={playlist.images?.[0].url ?? undefined} className="w-8 h-8 rounded-sm" alt="" />
              </Link>
            )}
          </div>
        }
        footer={
          <>
            <div className="ml-2">{playlist.tracks.total} items</div>
            <PanelMenu
              menuItems={[
                {
                  text: "View playlist on Spotify",
                  href: `https://open.spotify.com/playlist/${playlist.id}`,
                },
                {
                  text: "Import playlist",
                  onClick: () => importPlaylist(),
                },
                {
                  text: "Pull all tracks",
                  onClick: () => scrapeAll(),
                },
              ]}
            />
          </>
        }
        id={`playlist-${playlist.id}`}
        isLoading={isLoading}
      >
        {data?.tracks.map((t, j) => (
          <PlainButton
            href={`/track/${t.trackId?.split(":").at(-1)}`}
            key={j}
            className="w-full text-black dark:text-gray-200 no-underline hover:no-underline active:text-black dark:active:text-white"
            prefetch={false}
          >
            <span className="font-bold text-sm">{stripRemasterAnnotations(t.name)}</span> - {t.artists.join(", ")}
          </PlainButton>
        ))}
      </BasePanel>
    </>
  );
}
