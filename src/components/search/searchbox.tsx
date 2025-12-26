import { ROUTES } from "@/constants";
import { useGlobal } from "@/contexts/Global/context";
import { IndividualPlaylist } from "@/models/models";
import { useSearchStore } from "@/state/search";
import { trpc } from "@/utils/trpc";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import ImportPlaylistDialog from "../dialog/importplaylistdialog";

export default function SearchBox() {
  const router = useRouter();

  const [buttonText, setButtonText] = useState<string | JSX.Element>("Search");
  const getPlaylist = trpc.spotify.getPlaylistLazy.useMutation();

  const { setPlaylists } = useGlobal();
  const { setSearchText, searchText } = useSearchStore();

  const [playlist, setPlaylist] = useState<IndividualPlaylist>();
  const [isImportOpen, setIsImportOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    inputRef.current?.blur();

    if (searchText.startsWith("https://tabs.ultimate-guitar.com/tab/")) {
      router.push(ROUTES.TAB(searchText.slice(37)));
    } else if (searchText.startsWith("https://open.spotify.com/playlist/")) {
      setButtonText("Loading...");
      const matches = searchText.match(/https:\/\/open\.spotify\.com\/playlist\/(?<id>[0-9A-Za-z]+).*/);
      const playlistId = matches?.groups?.id!;
      getPlaylist.mutateAsync({ playlistId }).then((playlist: IndividualPlaylist) => {
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
      console.log(router.pathname);
      if (router.pathname.startsWith("/search/internal")) {
        router.push(`/search/internal?q=${encodeURIComponent(searchText)}`);
      } else if (router.pathname.startsWith("/search/external")) {
        router.push(`/search/external?q=${encodeURIComponent(searchText)}`);
      } else {
        router.push(`/search?q=${encodeURIComponent(searchText)}`);
      }
    }
  };

  const handleContextMenu = (e: any) => {
    e.preventDefault();
    router.push(`/search/internal?q=${encodeURIComponent(searchText)}`);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-gray-200">
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
            className="block w-full p-4 pl-10 text-gray-900 dark:border-gray-600 dark:text-gray-200 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500 text-base"
            placeholder="Song name, Tab URL, or Spotify playlist URL..."
            required
            value={searchText}
            ref={inputRef}
            onChange={(e) => {
              setSearchText(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit(e);
              }
            }}
          />
          <div className="absolute right-2.5 bottom-2 flex gap-4 items-center">
            {searchText !== "" && (
              <button onClick={() => setSearchText("")}>
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
            <button
              disabled={buttonText !== "Search"}
              type="submit"
              onContextMenu={handleContextMenu}
              className="text-white dark:text-black bg-blue-700 dark:bg-blue-300 hover:bg-blue-800 dark:hover:bg-blue-400 focus:ring-4 focus:outline-hidden focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 "
            >
              {buttonText}
            </button>
          </div>
        </div>
      </form>
      {isImportOpen && playlist && (
        <ImportPlaylistDialog playlist={playlist} isOpen={isImportOpen} setIsOpen={setIsImportOpen} />
      )}
    </>
  );
}
