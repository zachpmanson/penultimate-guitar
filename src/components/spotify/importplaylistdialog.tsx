import { useGlobal } from "@/contexts/Global/context";
import { Playlist, SearchResult, TabLinkDto, Track } from "@/models";
import { Dialog } from "@headlessui/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import DialogButton from "../save/dialogbutton";

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
            };
          } else if (results.length > 0) {
            newTab = {
              taburl: results[0].tab_url,
              name: results[0].song_name,
              artist: results[0].artist_name,
              version: results[0].version,
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
  }, [addSavedTab, playlist]);

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
            <span className="text-lg">
              Importing: <span className="font-bold">{playlist.name}</span>
            </span>
          </Dialog.Title>
          <Dialog.Description>
            <div className="font-bold"></div>
          </Dialog.Description>
          <hr className="m-4" />
          <div>
            Found {playlistTabs.length}/{playlist.tracks.length}
          </div>
          <div>Couldn&apos;t find {attemptCount - playlistTabs.length}</div>
          {currentlyFinding && (
            <div className="my-2">
              Finding:{" "}
              <span className="font-weight-">
                {currentlyFinding?.name} - {currentlyFinding?.artists}
              </span>
            </div>
          )}
          {attemptCount === playlist.tracks.length && (
            <div className="flex justify-end mt-4">
              <DialogButton
                fn={() => setIsOpen(false)}
                icon="Finish"
                disabled={false}
              />
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
