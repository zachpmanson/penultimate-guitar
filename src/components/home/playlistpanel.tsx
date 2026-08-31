import { Track } from "@/models/models";
import { Playlist } from "@/types/spotify";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { stripRemasterAnnotations } from "src/utils/title";
import BasePanel from "../shared/basepanel";
import PlainButton from "../shared/plainbutton";
import PanelMenu from "./panelmenu";

const TRACKS_PAGE_SIZE = 50;
const LONG_PRESS_MS = 600;

export default function PlaylistPanel({ playlist }: { playlist: Playlist }) {
  const [isOpen, setIsOpen] = useState(false);

  const [isImportOpen, setIsImportOpen] = useState(false);
  const getPlaylist = trpc.spotify.getPlaylistLazy.useMutation();

  const playlistId = playlist.uri.split(":").at(-1) ?? "";
  const { data, isLoading, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } =
    trpc.spotify.getPlaylistTracks.useInfiniteQuery(
      { playlistId, pageSize: TRACKS_PAGE_SIZE },
      {
        enabled: isOpen,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const tracks = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages[0]?.total ?? playlist.tracks.total;

  const [loadingAll, setLoadingAll] = useState(false);
  const [pulling, setPulling] = useState<string | null>(null);
  const hasNextPageRef = useRef(hasNextPage);
  const pullTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pullFired = useRef(false);

  useEffect(() => {
    hasNextPageRef.current = hasNextPage;
  }, [hasNextPage]);

  const importPlaylist = async () => {
    await getPlaylist.mutateAsync({ playlistId });
    setIsImportOpen(true);
  };

  // Load every remaining page, returning the flattened list.
  const loadAll = async (): Promise<Track[]> => {
    setLoadingAll(true);
    try {
      let guard = 0;
      let lastRes;
      while (hasNextPageRef.current && guard < 10000) {
        guard++;
        lastRes = await fetchNextPage();
        hasNextPageRef.current = lastRes.hasNextPage;
      }
      if (!lastRes || !lastRes.data) return tracks;
      return lastRes.data.pages.flatMap((p: any) => p.items);
    } finally {
      setLoadingAll(false);
    }
  };

  const onLoadMorePress = () => {
    if (pullTimer.current) clearTimeout(pullTimer.current);
    pullFired.current = false;
    pullTimer.current = setTimeout(() => {
      pullFired.current = true;
      loadAll();
    }, LONG_PRESS_MS);
  };
  const onLoadMoreRelease = async () => {
    if (pullTimer.current) {
      clearTimeout(pullTimer.current);
      pullTimer.current = null;
      if (!pullFired.current) fetchNextPage();
    }
  };

  const scrapeAll = async () => {
    if (!total) return;
    const all = await loadAll();
    for (let track of all) {
      setPulling(track.name);
      await fetch(`/track/${track.trackId}`).catch(() => console.log("Couldn't find track", track));
      await new Promise((r) => setTimeout(r, 2000));
    }
    setPulling(null);
  };

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
            <div className="ml-2">{total} items</div>
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
        isLoading={isLoading || loadingAll}
      >
        {tracks.map((t, j) => (
          <PlainButton
            href={`/track/${t.trackId}`}
            key={j}
            className="w-full text-black dark:text-gray-200 no-underline hover:no-underline active:text-black dark:active:text-white"
            prefetch={false}
          >
            <span className="font-bold text-sm">{stripRemasterAnnotations(t.name)}</span> - {t.artists.join(", ")}
          </PlainButton>
        ))}
        {hasNextPage && !loadingAll && (
          <PlainButton
            className="w-full text-black dark:text-gray-200 no-underline hover:no-underline active:text-black dark:active:text-white flex justify-center items-center h-12"
            onPointerDown={onLoadMorePress}
            onPointerUp={onLoadMoreRelease}
            onPointerLeave={() => {
              if (pullTimer.current) {
                clearTimeout(pullTimer.current);
                pullTimer.current = null;
              }
            }}
            isLoading={isFetching || isFetchingNextPage}
          >
            {isFetching || isFetchingNextPage ? "Loading…" : "Load more"}
          </PlainButton>
        )}
        {pulling && (
          <div className="flex justify-center items-center h-12 text-sm text-gray-500 dark:text-gray-400">
            Pulling {pulling}…
          </div>
        )}
      </BasePanel>
    </>
  );
}
