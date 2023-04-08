import { TabLinkDto } from "@/models";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { GlobalContextProps, GlobalContextProvider } from "./context";

const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [savedTabs, setSavedTabs] = useState<TabLinkDto[]>([]);
  const [globalLoading, setGlobalLoading] = useState("");

  useEffect(() => {
    getSavedTabs();
  }, []);

  useEffect(() => {
    updateLocalSaves(savedTabs);
  }, [savedTabs]);

  const getSavedTabs = () => {
    const parsedTabs = JSON.parse(
      localStorage.getItem("savedTabs") ?? "[]"
    ) as TabLinkDto[];
    setSavedTabs(parsedTabs.filter((t) => t.name && t.artist));
  };

  const updateLocalSaves = (saves: TabLinkDto[]) =>
    localStorage.setItem("savedTabs", JSON.stringify(saves));

  const setTabFolders = useCallback(
    (tabLink: TabLinkDto, folders: string[]) => {
      setSavedTabs((old) => {
        let newTabs = old.filter((t) => t.taburl !== tabLink.taburl);
        for (let folder of folders) {
          newTabs.push({ ...tabLink, folder: folder });
        }
        return newTabs;
      });
    },
    []
  );

  const addSavedTab = useCallback((newTab: TabLinkDto) => {
    setSavedTabs((old) => {
      let existingIndex = old.findIndex(
        (t) => t.taburl === newTab.taburl && t.folder === newTab.folder
      );

      return existingIndex === -1 ? [...old, newTab] : old;
    });
  }, []);

  const removesavedTab = useCallback((tab: TabLinkDto) => {
    setSavedTabs((old) => {
      let newTabs = old.filter(
        (t) => !(t.taburl === tab.taburl && t.folder === tab.folder)
      );
      return newTabs;
    });
  }, []);

  const isSaved = useCallback(
    (newTab: TabLinkDto) => {
      let existingIndex = savedTabs.findIndex(
        (t) => t.taburl === newTab.taburl
      );
      return existingIndex !== -1;
    },
    [savedTabs]
  );

  const value: GlobalContextProps = useMemo(
    () => ({
      setTabFolders: setTabFolders,
      addSavedTab: addSavedTab,
      removeSavedTab: removesavedTab,
      savedTabs: savedTabs,
      isSaved: isSaved,
      globalLoading: globalLoading,
      setGlobalLoading: setGlobalLoading,
    }),
    [
      setTabFolders,
      savedTabs,
      addSavedTab,
      removesavedTab,
      isSaved,
      globalLoading,
      setGlobalLoading,
    ]
  );

  return (
    <GlobalContextProvider value={value}>{children}</GlobalContextProvider>
  );
};

export default GlobalProvider;
