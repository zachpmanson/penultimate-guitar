import { useGlobal } from "@/contexts/Global/context";
import useSavedTabs from "@/hooks/useSavedTabs";
import { Playlist, TabLinkDto } from "@/models/models";
import { trpc } from "@/utils/trpc";
import { Menu, Transition } from "@headlessui/react";
import Link from "next/link";
import { Fragment, useState } from "react";
import ImportPlaylistDialog from "../dialog/importplaylistdialog";
import LoadingSpinner from "../loadingspinner";
import TabLink from "./tablink";
import { Folder } from "@/types/user";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";

function savedTabToFolders(savedTabs: TabLinkDto[]) {
  const folders: { [key: string]: TabLinkDto[] } = { Favourites: [] };
  for (let tab of savedTabs) {
    const folderName = tab.folder ?? "Favourites";
    if (folders[folderName]) {
      folders[folderName].push(tab);
    } else {
      folders[folderName] = [tab];
    }
  }
  return folders;
}

export default function SavedTabs() {
  const { savedTabs, isLoadingTabs } = useSavedTabs();
  const folders = Object.fromEntries(savedTabs.map((f) => [f.name, f.tabs]));
  return (
    <div>
      {Object.keys(savedTabs).length === 0 || (
        <div>
          <details open>
            <summary>
              <h1 className="text-center text-xl my-4">Favourites</h1>
            </summary>
            <div className="flex flex-col gap-1 mt-2">
              {isLoadingTabs && !savedTabs ? (
                <LoadingSpinner className="h-8" />
              ) : (
                savedTabs.map((folder, i) =>
                  folder.name === "Favourites" ? (
                    <div key={i} className="flex flex-col gap-1">
                      {savedTabs[i].tabs.map((t, j) => (
                        <TabLink key={j} tablink={{ ...t, saved: true }} />
                      ))}
                    </div>
                  ) : (
                    <div key={i}>
                      <FolderPanel folder={folder} />
                    </div>
                  )
                )
              )}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

function FolderPanel({ folder }: { folder: Folder }) {
  const [hovering, setHovering] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className={
        "bg-gray-200 rounded-xl border transition duration-75" +
        (hovering ? " hover:border-gray-400" : "")
      }
      onMouseOver={() => setHovering(true)}
      onMouseOut={() => setHovering(false)}
    >
      <div
        className="flex justify-between p-2 px-3 items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-lg">{folder.name}</h2>
        <div className="flex justify-between gap-2 items-center">
          {folder.imageUrl && (
            <Link
              href={`https://open.spotify.com/playlist/${folder.playlistUrl}`}
              target="_blank"
            >
              <img
                src={folder.imageUrl ?? undefined}
                className="w-8 h-8 rounded"
              />
            </Link>
          )}
          {isOpen ? (
            <ChevronDownIcon className="w-4 h-4" />
          ) : (
            <ChevronLeftIcon className="w-4 h-4" />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="flex flex-col gap-1 p-2 pt-0 mt-0">
          {folder.tabs.map((t, j) => (
            <TabLink key={j} tablink={{ ...t, saved: true }} />
          ))}
          <div className="flex justify-between items-middle">
            <div className="ml-2">{folder.tabs.length} items</div>
            <FolderMenu folder={folder} />
          </div>
        </div>
      )}
    </div>
  );
}

function FolderMenu({ folder }: { folder: Folder }) {
  const { removeFolder } = useSavedTabs();

  const { data, refetch } = trpc.spotify.getPlaylist.useQuery(
    { playlistId: folder.playlistUrl ?? "" },
    {
      enabled: false,
    }
  );
  const getTab = trpc.tab.getTabLazy.useMutation();
  const [playlist, setPlaylist] = useState<Playlist>();
  const [isImportOpen, setIsImportOpen] = useState(false);

  const refreshPlaylist = async () => {
    await refetch();
    setIsImportOpen(true);
    setPlaylist(data);
  };

  const scrapeAll = async () => {
    for (let tabLink of folder.tabs) {
      getTab.mutate(tabLink.taburl);
      await new Promise((r) => setTimeout(r, 8000));
    }
  };

  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button
            className={`
  border-gray-200 border rounded-xl transition ease-in-out
  flex items-center justify-center text-md text-lg  bg-white px-4 hover:border-gray-400
`}
          >
            <div className="w-4">▼</div>
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
          <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
            <div className="px-1 py-1 ">
              {folder.playlistUrl && (
                <>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href={`https://open.spotify.com/playlist/${folder.playlistUrl}`}
                        target="_blank"
                        className={`${
                          active ? "bg-blue-700 text-white" : "text-gray-900"
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm no-underline`}
                      >
                        View playlist on Spotify
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => refreshPlaylist()}
                        className={`${
                          active ? "bg-blue-700 text-white" : "text-gray-900"
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      >
                        Refresh playlist
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => scrapeAll()}
                        className={`${
                          active ? "bg-blue-700 text-white" : "text-gray-900"
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
                    onClick={() => removeFolder(folder.name)}
                    className={`${
                      active ? "bg-blue-700 text-white" : "text-gray-900"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
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
