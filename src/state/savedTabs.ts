import { AltVersion, SavedUserTabLinks, TabLinkDto } from "@/models/models";
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
    folderName: string,
  ) => void;
  setTabFolders: (tab: TabLinkDto, folders: string[], userId: string) => void;
  removeFolder: (folder: string, userId?: string) => void;
  setUserAllFolders: (tab: Folder[], userId: string) => void;
  setAllSavedTabs: (newValue: SavedUserTabLinks) => void;
  setBestTab: (userId: string, oldTaburl: string, newTab: AltVersion) => void;
};

export const useSavedTabsStore = create<SavedTabsState & SavedTabsActions>()(
  persist(
    (set) => ({
      savedTabs: { "@localStorage": [] },

      addTabLink: (tab: TabLinkDto, userId: string, folderName: string) => {
        set((old) => {
          let folderIndex = old.savedTabs[userId]?.findIndex(
            (f) => f.name === folderName,
          );

          const n = { ...old };

          if (folderIndex === -1) {
            // create new folder and add tab to it
            n.savedTabs[userId].push({
              name: folderName,
              id: 0,
              spotifyUserId: userId,
              tabs: [
                {
                  taburl: tab.taburl,
                  name: tab.name,
                  artist: tab.artist,
                  type: tab.type ?? null,
                  version: tab.version ?? null,
                  loadBest: tab.loadBest ?? null,
                },
              ],
              playlistUrl: null,
              imageUrl: null,
            });
          } else {
            const tabIndex = old.savedTabs[userId][folderIndex].tabs.findIndex(
              (t) => t.taburl === tab.taburl,
            );

            if (tabIndex === -1) {
              // add tab to folder
              n.savedTabs[userId][folderIndex].tabs.push({
                taburl: tab.taburl,
                name: tab.name,
                artist: tab.artist,
                type: tab.type ?? null,
                version: tab.version ?? null,
                loadBest: tab.loadBest ?? null,
              });
            } else {
              // update tab in folder
              n.savedTabs[userId][folderIndex].tabs[tabIndex] = {
                taburl: tab.taburl,
                name: tab.name,
                artist: tab.artist,
                type: tab.type ?? null,
                version: tab.version ?? null,
                loadBest: tab.loadBest ?? null,
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
            (f) => f.name === folderName,
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
        userId: string,
      ) => {
        console.log("setTabFolders", { tab, desiredFolders, userId });
        set((old) => {
          let n = { ...old };
          console.log({ n });
          for (let [i, folder] of n.savedTabs[userId].entries()) {
            const tabIndex = folder.tabs.findIndex(
              (t) => t.taburl === tab.taburl,
            );

            const positionInDesiredFolders = desiredFolders.findIndex(
              (f) => f === folder.name,
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
                loadBest: tab.loadBest ?? null,
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
              id: 0,
              spotifyUserId: userId,
              tabs: [
                {
                  taburl: tab.taburl,
                  name: tab.name,
                  artist: tab.artist,
                  type: tab.type ?? null,
                  version: tab.version ?? null,
                  loadBest: tab.loadBest ?? null,
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
            (f) => f.name !== folder,
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

      setBestTab: (userId: string, oldTaburl: string, newTab: AltVersion) => {
        set((old) => {
          let n = { ...old };
          for (let [i, folder] of n.savedTabs[userId].entries()) {
            for (let [j, tab] of folder.tabs.entries()) {
              if (tab.taburl === oldTaburl && tab.loadBest) {
                n.savedTabs[userId][i].tabs[j] = {
                  ...tab,
                  ...newTab,
                  loadBest: false,
                };
              }
            }
          }
          return n;
        });
      },
    }),
    {
      name: "saved-tabs-storage",
      version: 1, // a migration will be triggered if the version in the storage mismatches this one
      migrate: (persistedState: any, version): SavedTabsState => {
        if (version === 0) {
          type v0 = {
            savedTabs: {
              [key: string]: {
                id: string;
                taburl: string;
                folder: string;
                name: string;
                artist: string;
                type: string;
                version: number;
                spotifyUserId?: string;
                saved?: boolean;
              }[];
            };
          };
          const v0PersistedState = persistedState as v0;

          for (const [key, value] of Object.entries(
            v0PersistedState.savedTabs,
          )) {
            let folders: Record<string, Folder> = {};
            for (const tablink of value) {
              folders[tablink.folder ?? "Favourites"] = {
                name: tablink.folder ?? "Favourites",
                id: -1, // does this matter in local?
                spotifyUserId: tablink.spotifyUserId ?? "@localStorage",
                imageUrl: null,
                playlistUrl: null,
                tabs: [],
              };
            }

            for (const tablink of value) {
              folders[tablink.folder ?? "Favourites"].tabs.push({
                taburl: tablink.taburl,
                name: tablink.name ?? null,
                artist: tablink.artist ?? null,
                type: tablink.type ?? null,
                version: tablink.version ?? null,
                loadBest: null,
              });
            }

            persistedState.savedTabs[key] = Object.values(folders);
          }
          // if the stored value is in version 0, we rename the field to the new name
        }

        return persistedState;
      },
    },
  ),
);
