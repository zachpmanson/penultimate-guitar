import { Playlist } from "@/types/spotify";
import { trpc } from "@/utils/trpc";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useRef, useState } from "react";
import ImportPlaylistDialog from "../dialog/importplaylistdialog";
import LoadingSpinner, { Load } from "../loadingspinner";
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
    <div>
      <div className="" ref={divRef}></div>
      <div
        className={
          "bg-gray-200 dark:bg-gray-800 dark:border-gray-600 rounded-xl border transition-transform duration-75 max-h-fit " +
          (hovering ? " hover:border-gray-400 dark:hover:border-gray-700" : "")
        }
        id={`folder-${playlist.id}`}
        onMouseOver={() => setHovering(true)}
        onMouseOut={() => setHovering(false)}
      >
        <div
          className="flex justify-between p-2 px-3 items-center sticky top-0 bg-gray-200 dark:bg-gray-800 rounded-xl z-10"
          onClick={() => {
            if (isOpen && divRef.current && window.scrollY > divRef.current.offsetTop) {
              divRef.current.scrollIntoView({ behavior: "smooth" });
            }
            setIsOpen(!isOpen);
          }}
        >
          <h2 className="text-lg">{playlist.name}</h2>
          <div className="flex justify-between gap-2 items-center">
            {playlist.images?.at(-1)?.url && (
              <Link href={`https://open.spotify.com/playlist/${playlist.id}`} target="_blank" prefetch={false}>
                <img src={playlist.images?.[0].url ?? undefined} className="w-8 h-8 rounded" alt="" />
              </Link>
            )}
            <ChevronLeftIcon className={"w-4 h-4 transition " + (isOpen ? "-rotate-90" : "")} />
          </div>
        </div>
        {isOpen && (
          <div className={"flex flex-col gap-1 p-2 pt-0 mt-0 h-fit"}>
            {data ? (
              <>
                {data.tracks.map((t, j) => (
                  <PlainButton
                    href={`/track/${t.trackId?.split(":").at(-1)}`}
                    key={j}
                    className="w-full text-black dark:text-gray-200 no-underline hover:no-underline active:text-black dark:active:text-white"
                    prefetch={false}
                  >
                    <span className="font-bold text-sm">{t.name}</span> - {t.artists.join(", ")}
                  </PlainButton>
                ))}
              </>
            ) : (
              <div className="h-8">
                <LoadingSpinner className="h-full" />
              </div>
            )}
            <div className={"flex justify-between items-middle gap-2"}>
              <div className="ml-2">{playlist.tracks.total} items</div>
              {pulling && (
                <div className="flex flex-1 gap-1 items-center justify-end">
                  Pulling {pulling} <LoadingSpinner className="h-[1em]" />
                </div>
              )}
              {data && (
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
              )}
            </div>
          </div>
        )}
      </div>
      {isImportOpen && data && (
        <ImportPlaylistDialog playlist={data} isOpen={isImportOpen} setIsOpen={setIsImportOpen} />
      )}
    </div>
  );
}
