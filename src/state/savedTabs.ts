import { TabLinkDto } from "@/models/models";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type SavedTabsState = {
  savedTabs: { [key: string]: TabLinkDto[] };
};

type SavedTabsActions = {
  addTabLink: (newTab: TabLinkDto, userId?: string) => void;
  removeSavedTab: (tab: TabLinkDto, userId?: string) => void;
  setTabFolders: (tab: TabLinkDto, folders: string[], userId?: string) => void;
  setUserAllTabLinks: (tab: TabLinkDto[], userId: string) => void;
};

export const useSavedTabsStore = create<SavedTabsState & SavedTabsActions>()(
  persist(
    (set) => ({
      savedTabs: { "@localStorage": [] },
      addTabLink: (tab: TabLinkDto, userId?: string) => {
        const userKey = userId ?? "@localStorage";
        set((old) => {
          let existingIndex = old.savedTabs[userKey]?.findIndex(
            (t) => t.taburl === tab.taburl && t.folder === tab.folder
          );

          let newSavedTabs = { ...old.savedTabs };
          if (existingIndex === -1) newSavedTabs[userKey].push(tab);

          return {
            savedTabs: { ...newSavedTabs },
          };
        });
      },
      removeSavedTab: (tab: TabLinkDto, userId?: string) => {
        const userKey = userId ?? "@localStorage";
        set((old) => {
          let newSavedTabs = { ...old.savedTabs };
          let newTabs = newSavedTabs[userKey].filter(
            (t) => !(t.taburl === tab.taburl && t.folder === tab.folder)
          );
          newSavedTabs[userKey] = newTabs;
          return {
            savedTabs: newSavedTabs,
          };
        });
      },
      setTabFolders: (tab: TabLinkDto, folders: string[], userId?: string) => {
        const userKey = userId ?? "@localStorage";
        set((old) => {
          let newUserSavedTabs = old.savedTabs[userKey].filter(
            (t) =>
              t.taburl !== tab.taburl ||
              folders.includes(t.folder ?? "Favourites")
          );
          let currentFolders = newUserSavedTabs
            .filter((t) => t.taburl === tab.taburl)
            .map((f) => f.folder);

          for (let folder of folders.filter(
            (f) => !currentFolders.includes(f)
          )) {
            newUserSavedTabs.push({ ...tab, folder: folder });
          }

          return {
            savedTabs: { ...old.savedTabs, [userKey]: newUserSavedTabs },
          };
        });
      },

      setUserAllTabLinks: (tabs: TabLinkDto[], userId: string) => {
        set((old) => ({
          savedTabs: { ...old.savedTabs, [userId]: tabs },
        }));
      },
    }),
    {
      name: "saved-tabs-storage", // name of the item in the storage (must be unique)
    }
  )
);
