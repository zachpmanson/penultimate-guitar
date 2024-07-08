import { useGlobal } from "@/contexts/Global/context";
import { Playlist } from "@/models/models";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ImportPlaylistDialog from "../dialog/importplaylistdialog";
import { processPlaylist } from "@/lib/processPlaylist";
import { parseAsString, useQueryState } from "nuqs";

export default function SearchBox() {
  const router = useRouter();

  const [buttonText, setButtonText] = useState<string | JSX.Element>("Search");

  const { setPlaylists } = useGlobal();

  const [localSearchText, setLocalSearchText] = useState("");

  const [playlist, setPlaylist] = useState<Playlist>();
  const [isImportOpen, setIsImportOpen] = useState(false);

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const search: string = event.target.url.value;

    if (search.startsWith("https://tabs.ultimate-guitar.com/tab/")) {
      router.push(`/tab/${search.slice(37)}`);
    } else if (search.startsWith("https://open.spotify.com/playlist/")) {
      setButtonText("Loading...");
      const matches = search.match(
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

        setButtonText("Search");
      });
    } else {
      router.push(`/search?q=${encodeURIComponent(event.target.url.value)}`);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label
          htmlFor="default-search"
          className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
        >
          Search
        </label>
        <div className="relative max-w-2xl mx-auto my-4">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              aria-hidden="true"
              className="w-5 h-5 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          <input
            type="search"
            id="default-search"
            name="url"
            className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 "
            placeholder="Song name, Tab URL, or Spotify playlist URL..."
            required
            value={localSearchText}
            onChange={(e) => setLocalSearchText(e.target.value)}
          />
          <button
            disabled={buttonText !== "Search"}
            type="submit"
            className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 "
          >
            {buttonText}
          </button>
        </div>
      </form>
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
