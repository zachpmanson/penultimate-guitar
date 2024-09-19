import useSavedTabs from "@/hooks/useSavedTabs";
import { IndividualPlaylist } from "@/models/models";
import { Playlist } from "@/types/spotify";
import { trpc } from "@/utils/trpc";
import { Menu, Transition } from "@headlessui/react";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { Fragment, useRef, useState } from "react";
import ImportPlaylistDialog from "../dialog/importplaylistdialog";
import LoadingSpinner from "../loadingspinner";
import PlainButton from "../shared/plainbutton";

export default function Playlists() {
  const { data, isLoading, isFetching, hasNextPage, fetchNextPage } =
    trpc.user.getPlaylists.useInfiniteQuery(
      {
        pageSize: 20,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialCursor: 1,
      }
    );

  const playlists = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div>
      <div>
        <div>
          <h1 className="text-left text-xl my-4">Playlists</h1>
        </div>
        {isLoading ? (
          <LoadingSpinner className="h-8" />
        ) : playlists.length === 0 ? (
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
                >
                  {isFetching ? (
                    <LoadingSpinner className="h-full" />
                  ) : (
                    "Load more"
                  )}
                </PlainButton>
              )}
            </>
          </div>
        )}
      </div>
    </div>
  );
}

function PlaylistPanel({ playlist }: { playlist: Playlist }) {
  const [hovering, setHovering] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const divRef = useRef<HTMLDivElement>(null);

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
        id={`folder-${playlist.uri}`}
        onMouseOver={() => setHovering(true)}
        onMouseOut={() => setHovering(false)}
      >
        <div
          className="flex justify-between p-2 px-3 items-center sticky top-0 bg-gray-200 dark:bg-gray-800 rounded-xl"
          onClick={() => {
            // if (
            //   isOpen &&
            //   divRef.current &&
            //   divRef.current.offsetTop < window.innerHeight
            // ) {
            //   divRef.current?.scrollIntoView({ behavior: "smooth" });
            // }
            setIsOpen(!isOpen);
          }}
        >
          <h2 className="text-lg">{playlist.name}</h2>
          <div className="flex justify-between gap-2 items-center">
            {playlist.images?.at(-1)?.url && (
              <Link
                href={`https://open.spotify.com/playlist/${playlist.uri}`}
                target="_blank"
              >
                <img
                  src={playlist.images?.[0].url ?? undefined}
                  className="w-8 h-8 rounded"
                />
              </Link>
            )}
            <ChevronLeftIcon
              className={"w-4 h-4 transition " + (isOpen ? "-rotate-90" : "")}
            />
          </div>
        </div>
        {isOpen && (
          <div className={"flex flex-col gap-1 p-2 pt-0 mt-0 h-fit"}>
            {data ? (
              <>
                {data.tracks.map((t, j) => (
                  <Link
                    href={`/track/${t.trackId?.split(":").at(-1)}`}
                    key={j}
                    className="w-full text-black dark:text-gray-200 no-underline hover:no-underline active:text-black dark:active:text-white"
                  >
                    <PlainButton>
                      <span className="font-bold text-sm">{t.name}</span> -{" "}
                      {t.artists.join(", ")}
                    </PlainButton>
                  </Link>
                ))}
              </>
            ) : (
              <div className="h-8">
                <LoadingSpinner className="h-full" />
              </div>
            )}
            <div className={"flex justify-between items-middle "}>
              <div className="ml-2">{playlist.tracks.total} items</div>
              {data && <PlaylistMenu playlist={data} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PlaylistMenu({ playlist }: { playlist: IndividualPlaylist }) {
  const { removeFolder } = useSavedTabs();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const getPlaylist = trpc.spotify.getPlaylistLazy.useMutation();
  // const _d = trpc.spotify.getPlaylist.useInfiniteQuery(
  //   { playlistId: playlist.playlistId ?? "", save: true },
  //   {
  //     enabled: isImportOpen,
  //     getNextPageParam: (lastPage) => lastPage.nextCursor,
  //     initialCursor: 0,
  //   }
  // );

  const importPlaylist = async () => {
    await getPlaylist.mutateAsync({ playlistId: playlist.playlistId });

    setIsImportOpen(true);
  };

  const scrapeAll = async () => {
    for (let track of playlist.tracks) {
      await fetch(`/track/${track.trackId.split(":").at(-1)}`).catch(() =>
        console.log("Couldn't find track", track)
      );
      await new Promise((r) => setTimeout(r, 2000));
    }
  };

  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button>
            <PlainButton noPadding>
              <div className="px-4 w-10 flex justify-center items-center">
                ▼
              </div>
            </PlainButton>
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="z-10 absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="px-1 py-1 ">
              {playlist.playlistId && (
                <>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href={`https://open.spotify.com/playlist/${playlist.playlistId}`}
                        target="_blank"
                        className={`${
                          active
                            ? "bg-blue-700 text-white"
                            : "text-gray-900  dark:text-gray-200"
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm no-underline`}
                      >
                        View playlist on Spotify
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => importPlaylist()}
                        className={`${
                          active
                            ? "bg-blue-700 text-white"
                            : "text-gray-900  dark:text-gray-200"
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      >
                        Import playlist
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => scrapeAll()}
                        className={`${
                          active
                            ? "bg-blue-700 text-white"
                            : "text-gray-900  dark:text-gray-200"
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      >
                        Pull all tracks
                      </button>
                    )}
                  </Menu.Item>
                </>
              )}
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => removeFolder(playlist.name)}
                    className={`${
                      active ? "bg-blue-700 text-white" : "text-gray-900"
                    } group dark:text-white flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    Delete
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
      {isImportOpen && playlist && (
        <ImportPlaylistDialog
          playlist={playlist}
          isOpen={isImportOpen}
          setIsOpen={setIsImportOpen}
        />
      )}
    </>
  );
}
