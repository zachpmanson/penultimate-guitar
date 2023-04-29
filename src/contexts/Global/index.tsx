import { Mode, TabLinkDto } from "@/models";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { GlobalContextProps, GlobalContextProvider } from "./context";

const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [savedTabs, setSavedTabs] = useState<TabLinkDto[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [globalLoading, setGlobalLoading] = useState("");
  const [mode, setMode] = useState<Mode>("Default");

  useEffect(() => {
    getSavedTabs();
    getLocalMode();
  }, []);

  useEffect(() => {
    updateLocalSaves(savedTabs);
  }, [savedTabs]);

  useEffect(() => {
    updateLocalMode(mode);
  }, [mode]);

  const updateLocalMode = (mode: Mode) =>
    localStorage.setItem("mode", JSON.stringify(mode));

  const getSavedTabs = () => {
    const parsedTabs = JSON.parse(
      localStorage.getItem("savedTabs") ?? "[]"
    ) as TabLinkDto[];
    setSavedTabs(parsedTabs.filter((t) => t.name && t.artist));
  };

  const getLocalMode = () => {
    const parsedMode = JSON.parse(
      localStorage.getItem("mode") ?? "Default"
    ) as Mode;
    setMode(parsedMode);
  };

  const updateLocalSaves = (saves: TabLinkDto[]) =>
    localStorage.setItem("savedTabs", JSON.stringify(saves));

  // removes all taburl in all folders, readds taburl to folder in string[]
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

  const removeSavedTab = useCallback((tab: TabLinkDto) => {
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
      setTabFolders,
      addSavedTab,
      removeSavedTab,
      savedTabs,
      isSaved,
      searchText,
      setSearchText,
      globalLoading,
      setGlobalLoading,
      mode,
      setMode,
    }),
    [
      setTabFolders,
      savedTabs,
      addSavedTab,
      removeSavedTab,
      isSaved,
      searchText,
      setSearchText,
      globalLoading,
      setGlobalLoading,
      mode,
      setMode,
    ]
  );

  return (
    <GlobalContextProvider value={value}>{children}</GlobalContextProvider>
  );
};

export default GlobalProvider;
