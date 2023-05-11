import { useGlobal } from "@/contexts/Global/context";
import {
  Playlist,
  SearchResult,
  TabLinkDto,
  TabType,
  Track,
} from "@/models/models";
import { Dialog } from "@headlessui/react";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import DialogButton from "./dialogbutton";

type ImportPlaylistDialogProps = {
  playlist: Playlist;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export default function ImportPlaylistDialog({
  playlist,
  isOpen,
  setIsOpen,
}: ImportPlaylistDialogProps) {
  const { addSavedTab } = useGlobal();
  const [playlistTabs, setPlaylistTabs] = useState<TabLinkDto[]>([]);
  const [currentlyFinding, setCurrentlyFinding] = useState<Track>();
  const [attemptCount, setAttemptCount] = useState(0);

  useEffect(() => {
    const getSearch = async (searchString: string) => {
      await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          value: searchString,
          search_type: "title",
          page: 1,
        }),
      })
        .then((res) => res.json())
        .then((results: SearchResult[]) => {
          results.sort((a, b) => b.rating - a.rating);
          const chordResults = results.filter((r) => r.type === "Chords");
          let newTab!: TabLinkDto;
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
          if (newTab !== undefined) {
            setPlaylistTabs((old) => [...old, newTab]);
            addSavedTab({ ...newTab, folder: playlist.name });

            console.log(
              "Found",
              `${searchString}`,
              `${results.length} results`
            );
          } else {
            console.log("Couldn't find", `${searchString}`, results);
          }
        });
    };

    const getTabs = async () => {
      for (let track of playlist.tracks) {
        if (isOpen) {
          setCurrentlyFinding(track);
          await getSearch(`${track.name} ${track.artists}`);
          setAttemptCount((old) => old + 1);
        }
      }
      setCurrentlyFinding(undefined);
    };

    getTabs().catch();
  }, [addSavedTab, isOpen, playlist]);

  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-xs rounded bg-white p-4">
          <Dialog.Title>
            <div className="flex flex-col gap-2">
              <div className="text-lg font-bold">{playlist.name}</div>

              <div className="flex gap-2 align-middle justify-between">
                {playlist.image && (
                  <Image
                    src={playlist.image}
                    alt="Playlist image"
                    width={60}
                    height={60}
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
          <Dialog.Description>
            <div className="font-bold"></div>
          </Dialog.Description>
          <hr className="m-4" />
          <div className="flex justify-between">
            <div>Found {playlistTabs.length}</div>
            <div>Couldn&apos;t find {attemptCount - playlistTabs.length}</div>
          </div>
          <div className="my-2 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-200">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{
                width: `${Math.round(
                  (100 * attemptCount) / playlist.tracks.length
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
          {attemptCount === playlist.tracks.length && (
            <div className="flex justify-end mt-4">
              <DialogButton onClick={() => setIsOpen(false)} disabled={false}>
                Finish
              </DialogButton>
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
