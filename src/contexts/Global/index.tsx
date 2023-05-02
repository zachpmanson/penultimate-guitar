import { Mode, TabLinkDto } from "@/models/models";
import { ChordDB } from "@/models/chorddb.models";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GlobalContextProps, GlobalContextProvider } from "./context";

const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [savedTabs, setSavedTabs] = useState<TabLinkDto[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [globalLoading, setGlobalLoading] = useState("");
  const [mode, setMode] = useState<Mode>("default");
  const [chords, setChords] = useState<ChordDB.GuitarChords>();

  const notInitialRender = useRef(false);

  useEffect(() => {
    getSavedTabs();
    getLocalMode();
    getChords();
  }, []);

  useEffect(() => {
    console.log("notInitialRender", notInitialRender);
    if (notInitialRender.current) {
      updateLocalSaves(savedTabs);
    } else {
      notInitialRender.current = true;
    }
  }, [savedTabs]);

  useEffect(() => {
    updateLocalMode(mode);
  }, [mode]);

  const getSavedTabs = () => {
    console.log("get local");
    const parsedTabs = JSON.parse(
      localStorage.getItem("savedTabs") ?? "[]"
    ) as TabLinkDto[];
    setSavedTabs(parsedTabs.filter((t) => t.name && t.artist));
  };

  const getLocalMode = () => {
    const parsedMode = (localStorage.getItem("mode") ?? "Default") as Mode;
    setMode(parsedMode);
  };

  const getChords = () => {
    let guitarChords = JSON.parse(localStorage.getItem("guitarChords") ?? "{}");
    if (guitarChords.main) {
      setChords(guitarChords as ChordDB.GuitarChords);
    } else {
      fetch("/chords/guitar.json", {
        method: "GET",
      })
        .then((res) => res.json())
        .then((res: ChordDB.GuitarChords) => {
          setChords(res);
          localStorage.setItem("guitarChords", JSON.stringify(res));
        });
    }
  };

  const updateLocalMode = (mode: Mode) => localStorage.setItem("mode", mode);

  const updateLocalSaves = (saves: TabLinkDto[]) => {
    console.log("updating local");

    localStorage.setItem("savedTabs", JSON.stringify(saves));
  };

  // removes all taburl in all folders, readds taburl to folder in string[]
  const setTabFolders = useCallback(
    (tabLink: TabLinkDto, folders: string[]) => {
      setSavedTabs((old) => {
        let newTabs = old.filter(
          (t) =>
            t.taburl !== tabLink.taburl ||
            folders.includes(t.folder ?? "Favourites")
        );
        let currentFolders = newTabs
          .filter((t) => t.taburl === tabLink.taburl)
          .map((f) => f.folder);
        for (let folder of folders.filter((f) => !currentFolders.includes(f))) {
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
      chords,
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
      chords,
    ]
  );

  return (
    <GlobalContextProvider value={value}>{children}</GlobalContextProvider>
  );
};

export default GlobalProvider;
