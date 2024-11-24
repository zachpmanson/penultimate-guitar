import useSavedTabs from "@/hooks/useSavedTabs";
import {
  IndividualPlaylist,
  SearchResult,
  TabLinkDto,
  TabType,
  Track,
} from "@/models/models";
import { trpc } from "@/utils/trpc";
import { Dialog } from "@headlessui/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import DialogButton from "./dialogbutton";

function getTabLinkIfExists(results: SearchResult[]): TabLinkDto | undefined {
  results.sort((a, b) => b.rating - a.rating);
  const chordResults = results.filter((r) => r.type === "Chords");
  let newTab: TabLinkDto | undefined = undefined;
  if (chordResults.length > 0) {
    newTab = {
      taburl: chordResults[0].tab_url,
      name: chordResults[0].song_name,
      artist: chordResults[0].artist_name,
      version: chordResults[0].version,
      type: chordResults[0].type as TabType,
    };
  } else if (results.length > 0) {
    newTab = {
      taburl: results[0].tab_url,
      name: results[0].song_name,
      artist: results[0].artist_name,
      version: results[0].version,
      type: results[0].type as TabType,
    };
  }
  return newTab;
}

export default function ImportPlaylistDialog({
  playlist,
  isOpen,
  setIsOpen,
  navigateOnComplete,
}: {
  playlist: IndividualPlaylist;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  navigateOnComplete?: string;
}) {
  const router = useRouter();
  const { mutateAsync: search } = trpc.tab.searchOneLazy.useMutation();
  const { addSavedTab } = useSavedTabs();
  const [currentlyFinding, setCurrentlyFinding] = useState<Track>();
  const alreadySearching = useRef(false);
  const [nFound, setPlaylistTabs] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);

  useEffect(() => {
    const getSearch = async (searchString: string, artist: string) => {
      const topResult = await search({
        value: `${searchString} ${artist}`,
        type: "chords",
      });
      if (topResult) {
        setPlaylistTabs((o) => o + 1);
        addSavedTab(
          {
            artist: topResult.artist_name,
            name: topResult.song_name,
            type: topResult.type,
            taburl: topResult.taburl,
            saved: true,
            loadBest: true,
          },
          playlist.name,
        );
      }
    };

    const getTabs = async (currentPlaylist: IndividualPlaylist) => {
      alreadySearching.current = true;
      for (let track of currentPlaylist.tracks) {
        setCurrentlyFinding(track);

        await getSearch(track.name, track.artists.join(" "));
        setAttemptCount((old) => old + 1);
      }
      setCurrentlyFinding(undefined);
    };

    if (isOpen && playlist && !currentlyFinding && !alreadySearching.current) {
      getTabs(playlist).catch();
    }
  }, [
    addSavedTab,
    search,
    isOpen,
    playlist,
    currentlyFinding,
    alreadySearching,
  ]);

  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-xs rounded bg-white dark:bg-gray-800 p-4">
          <Dialog.Title>
            <div className="flex flex-col gap-2">
              <div className="text-lg font-bold">{playlist.name}</div>

              <div className="flex gap-2 align-middle justify-between">
                {playlist.image && (
                  <Image
                    src={playlist.image}
                    alt=""
                    width={60}
                    height={60}
                    title="Go to"
                    className="rounded-md"
                  />
                )}
                <div className="flex flex-col my-auto text-right">
                  <div className="text-sm">{playlist.tracks.length} tracks</div>
                  <div className="text-xs">Created by {playlist.owner}</div>
                </div>
              </div>
            </div>
          </Dialog.Title>
          <Dialog.Description></Dialog.Description>
          <hr className="m-4 dark:border-gray-600" />

          <div className="flex justify-between">
            <div>Found {nFound}</div>
            <div>Couldn&apos;t find {attemptCount - nFound}</div>
          </div>
          <div className="my-2 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-200">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{
                width: `${Math.round(
                  (100 * attemptCount) / playlist.tracks.length,
                )}%`,
              }}
            ></div>
          </div>
          {currentlyFinding && (
            <div className="my-2">
              Finding:
              <br />
              <span className="font-weight-">
                {currentlyFinding?.name} - {currentlyFinding?.artists}
              </span>
            </div>
          )}
          {attemptCount >= playlist.tracks.length && (
            <div className="flex justify-end mt-4">
              <DialogButton
                onClick={() => {
                  setIsOpen(false);
                  if (navigateOnComplete) router.push(navigateOnComplete);
                }}
                disabled={false}
              >
                Finish
              </DialogButton>
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
