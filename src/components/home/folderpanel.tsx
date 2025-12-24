import useSavedTabs from "@/hooks/useSavedTabs";
import { IndividualPlaylist } from "@/models/models";
import { Folder } from "@/types/user";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { useState } from "react";
import ImportPlaylistDialog from "../dialog/importplaylistdialog";
import PanelMenu from "./panelmenu";
import TabLink from "./tablink";
import { sortByName } from "@/utils/sort";
import BasePanel from "../shared/basepanel";

export default function FolderPanel({ folder }: { folder: Folder }) {
  const isOpen = folder.isOpen;
  const { removeFolder, setFolderOpen } = useSavedTabs();
  const setIsOpen = (v: boolean) => setFolderOpen(folder.name, v);

  const { data, refetch } = trpc.spotify.getPlaylist.useQuery(
    { playlistId: folder.playlistUrl ?? "", save: true },
    {
      enabled: false,
    }
  );
  const getTab = trpc.tab.getTabLazy.useMutation();
  const [playlist, setPlaylist] = useState<IndividualPlaylist>();
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
      <BasePanel
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        id={`folder-${folder.id}`}
        header={
          <>
            <div className="flex justify-between w-full gap-2 items-center">
              <h2 className="text-lg">{folder.name}</h2>
              {folder.imageUrl && (
                <Link href={`https://open.spotify.com/playlist/${folder.playlistUrl}`} target="_blank">
                  <img src={folder.imageUrl ?? undefined} className="w-8 h-8 rounded" alt="" />
                </Link>
              )}
            </div>
          </>
        }
        footer={
          <>
            <div className="ml-2">{folder.tabs?.length} items</div>
            <PanelMenu
              menuItems={[
                {
                  text: "View playlist on Spotify",
                  href: `https://open.spotify.com/playlist/${folder.playlistUrl}`,
                },
                {
                  text: "Refresh playlist",
                  onClick: () => refreshPlaylist(),
                },
                {
                  text: "Delete",
                  onClick: () => removeFolder(folder.name),
                },
                {
                  text: "Pull all tracks",
                  onClick: () => scrapeAll(),
                },
              ]}
            />
            {isImportOpen && playlist && (
              <ImportPlaylistDialog playlist={playlist} isOpen={isImportOpen} setIsOpen={setIsImportOpen} />
            )}
          </>
        }
      >
        {folder.tabs
          .sort((a, b) => sortByName(a.name ?? "", b.name ?? ""))
          .map((t, j) => (
            <TabLink key={j} tablink={{ ...t, saved: true }} folder={folder.name} />
          ))}
      </BasePanel>
    </>
  );
}
