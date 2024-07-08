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
  const folders = !!savedTabs ? savedTabToFolders(savedTabs) : {};
  return (
    <div>
      {Object.keys(savedTabs).length === 0 || (
        <div>
          <details open>
            <summary>
              <h1 className="text-center text-2xl my-4">Favourites</h1>
            </summary>
            <div className="flex flex-col gap-2 mt-2">
              {isLoadingTabs ? (
                <LoadingSpinner />
              ) : (
                Object.keys(folders).map((folder, i) =>
                  folder === "Favourites" ? (
                    <div key={i} className="flex flex-col gap-2">
                      {folders[folder].map((t, j) => (
                        <TabLink key={j} tablink={{ ...t, saved: true }} />
                      ))}
                    </div>
                  ) : (
                    <div key={i}>
                      <Folder folders={folders} folder={folder} />
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

function Folder({
  folders,
  folder,
}: {
  folders: {
    [key: string]: TabLinkDto[];
  };
  folder: string;
}) {
  const [hovering, setHovering] = useState(false);
  return (
    <details
      className={
        "bg-gray-200 rounded-xl  border transition duration-75" +
        (hovering ? " hover:border-gray-400" : "")
      }
      onMouseOver={() => setHovering(true)}
      onMouseOut={() => setHovering(false)}
    >
      <summary className="p-3">
        <h2 className="text-xl">{folder}</h2>
      </summary>

      <div className="flex flex-col gap-2 m-4 mt-0">
        {folders[folder].map((t, j) => (
          <TabLink key={j} tablink={{ ...t, saved: true }} />
        ))}
        <div className="flex justify-between items-middle">
          <div className="ml-2">{folders[folder].length} items</div>
          <FolderMenu folder={folder} />
        </div>
      </div>
    </details>
  );
}

function FolderMenu({ folder }: { folder: string }) {
  const { playlists } = useGlobal();
  const { savedTabs, removeSavedTab } = useSavedTabs();

  const { data, refetch } = trpc.getPlaylists.useQuery(
    { playlistId: playlists[folder] },
    {
      enabled: false,
    }
  );
  const getTab = trpc.tab.getTabLazy.useMutation();
  const [playlist, setPlaylist] = useState<Playlist>();
  const [isImportOpen, setIsImportOpen] = useState(false);

  const folders = savedTabToFolders(savedTabs);

  const refreshPlaylist = async (folderName: string) => {
    await refetch();
    setIsImportOpen(true);
    setPlaylist(data);
  };

  const deleteFolder = (folder: string) => {
    for (let tablink of savedTabs) {
      if (tablink.folder === folder) {
        removeSavedTab(tablink);
      }
    }
  };

  const scrapeAll = async (folder: string) => {
    for (let tabLink of folders[folder]) {
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
  border-gray-200 border-2 rounded-xl transition ease-in-out
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
              {playlists[folder] && (
                <>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href={`https://open.spotify.com/playlist/${playlists[folder]}`}
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
                        onClick={() => refreshPlaylist(folder)}
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
                        onClick={() => scrapeAll(folder)}
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
                    onClick={() => deleteFolder(folder)}
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
