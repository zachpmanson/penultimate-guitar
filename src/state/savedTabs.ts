import { SavedUserTabLinks, TabLinkDto } from "@/models/models";
import { Folder } from "@/types/user";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type SavedTabsState = {
  savedTabs: { [key: string]: Folder[] };
};

type SavedTabsActions = {
  addTabLink: (newTab: TabLinkDto, userId: string, folderName: string) => void;
  removeSavedTab: (
    newTab: TabLinkDto,
    userId: string,
    folderName: string
  ) => void;
  setTabFolders: (tab: TabLinkDto, folders: string[], userId: string) => void;
  removeFolder: (folder: string, userId?: string) => void;
  setUserAllFolders: (tab: Folder[], userId: string) => void;
  setAllSavedTabs: (newValue: SavedUserTabLinks) => void;
};

export const useSavedTabsStore = create<SavedTabsState & SavedTabsActions>()(
  persist(
    (set) => ({
      savedTabs: { "@localStorage": [] },

      addTabLink: (tab: TabLinkDto, userId: string, folderName: string) => {
        set((old) => {
          let folderIndex = old.savedTabs[userId]?.findIndex(
            (f) => f.name === folderName
          );

          const n = { ...old };

          if (folderIndex === -1) {
            // create new folder and add tab to it
            n.savedTabs[userId].push({
              name: folderName,
              id: "",
              spotifyUserId: userId,
              tabs: [
                {
                  taburl: tab.taburl,
                  name: tab.name,
                  artist: tab.artist,
                  type: tab.type ?? null,
                  version: tab.version ?? null,
                },
              ],
              playlistUrl: null,
              imageUrl: null,
            });
          } else {
            const tabIndex = old.savedTabs[userId][folderIndex].tabs.findIndex(
              (t) => t.taburl === tab.taburl
            );

            if (tabIndex === -1) {
              // add tab to folder
              n.savedTabs[userId][folderIndex].tabs.push({
                taburl: tab.taburl,
                name: tab.name,
                artist: tab.artist,
                type: tab.type ?? null,
                version: tab.version ?? null,
              });
            } else {
              // update tab in folder
              n.savedTabs[userId][folderIndex].tabs[tabIndex] = {
                taburl: tab.taburl,
                name: tab.name,
                artist: tab.artist,
                type: tab.type ?? null,
                version: tab.version ?? null,
              };
            }
          }
          console.log({ n });

          return n;
        });
      },
      removeSavedTab: (tab: TabLinkDto, userId: string, folderName: string) => {
        set((old) => {
          let n = { ...old };
          let folderIndex = n.savedTabs[userId]?.findIndex(
            (f) => f.name === folderName
          );

          if (folderIndex === -1) return old;

          n.savedTabs[userId][folderIndex].tabs = n.savedTabs[userId][
            folderIndex
          ].tabs.filter((t) => !(t.taburl === tab.taburl));

          return n;
        });
      },
      setTabFolders: (
        tab: TabLinkDto,
        desiredFolders: string[],
        userId: string
      ) => {
        console.log("setTabFolders", { tab, desiredFolders, userId });
        set((old) => {
          let n = { ...old };
          console.log({ n });
          for (let [i, folder] of n.savedTabs[userId].entries()) {
            const tabIndex = folder.tabs.findIndex(
              (t) => t.taburl === tab.taburl
            );

            const positionInDesiredFolders = desiredFolders.findIndex(
              (f) => f === folder.name
            );
            const weWantItInFolder = positionInDesiredFolders !== -1;
            const existsInFolder = tabIndex !== -1;
            if (!existsInFolder && weWantItInFolder) {
              folder.tabs.push({
                taburl: tab.taburl,
                name: tab.name,
                artist: tab.artist,
                type: tab.type ?? null,
                version: tab.version ?? null,
              });
            } else if (existsInFolder && !weWantItInFolder) {
              folder.tabs = folder.tabs.filter((t) => t.taburl !== tab.taburl);
            }

            n.savedTabs[userId][i] = folder;

            if (weWantItInFolder) {
              console.log("splicing", {
                desiredFolders,
                positionInDesiredFolders,
              });
              // delete desiredFolders[positionInDesiredFolders];
              desiredFolders.splice(positionInDesiredFolders, 1);
            }
          }
          console.log({ desiredFolders });

          for (let folder of desiredFolders) {
            n.savedTabs[userId].push({
              name: folder,
              id: "",
              spotifyUserId: userId,
              tabs: [
                {
                  taburl: tab.taburl,
                  name: tab.name,
                  artist: tab.artist,
                  type: tab.type ?? null,
                  version: tab.version ?? null,
                },
              ],
              playlistUrl: null,
              imageUrl: null,
            });
          }

          return n;
        });
      },

      removeFolder: (folder: string, userId?: string) => {
        const userKey = userId ?? "@localStorage";
        set((old) => {
          let n = { ...old };

          n.savedTabs[userKey] = n.savedTabs[userKey].filter(
            (f) => f.name !== folder
          );

          return n;
        });
      },

      setUserAllFolders: (folders: Folder[], userId: string) => {
        set((old) => ({
          savedTabs: { ...old.savedTabs, [userId]: folders },
        }));
      },
      setAllSavedTabs: (newValue: SavedUserTabLinks) => {
        set({ savedTabs: newValue });
      },
    }),
    {
      name: "saved-tabs-storage",
    }
  )
);
