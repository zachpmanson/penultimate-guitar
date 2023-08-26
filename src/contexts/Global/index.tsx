import {
  Config,
  defaultConfig,
  Font,
  Mode,
  PlaylistCollection,
  TabLinkDto,
  Theme,
} from "@/models/models";
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
  const [playlists, setPlaylists] = useState<PlaylistCollection>({});
  const [config, setConfig] = useState<Config>(defaultConfig);
  const [chords, setChords] = useState<ChordDB.GuitarChords>();

  const notInitialRender = useRef(false);

  useEffect(() => {
    getSavedTabs();
    getLocalConfig();
    getChords();
    getPlaylists();
  }, []);

  useEffect(() => {
    if (notInitialRender.current) {
      updateLocalSaves(savedTabs);
    } else {
      notInitialRender.current = true;
    }
  }, [savedTabs]);

  useEffect(() => {
    console.log("useEffect config", config);
    updateLocalConfig(config);
  }, [config]);

  useEffect(() => {
    updatePlaylists(playlists);
  }, [playlists]);

  const getSavedTabs = () => {
    const parsedTabs = JSON.parse(
      localStorage.getItem("savedTabs") ?? "[]"
    ) as TabLinkDto[];
    setSavedTabs(parsedTabs.filter((t) => t.name && t.artist));
  };

  const getLocalConfig = () => {
    const rawConfig = localStorage.getItem("config");
    const parsedConfig = rawConfig ? JSON.parse(rawConfig) : defaultConfig;
    setConfig(parsedConfig);
  };

  const getPlaylists = () => {
    const parsedPlaylists = JSON.parse(
      localStorage.getItem("playlists") ?? "{}"
    ) as PlaylistCollection;
    setPlaylists(parsedPlaylists);
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

  const updateLocalConfig = (config: Config) =>
    localStorage.setItem("config", JSON.stringify(config));

  const updateLocalSaves = (saves: TabLinkDto[]) => {
    localStorage.setItem("savedTabs", JSON.stringify(saves));
  };

  const updatePlaylists = (playlists: PlaylistCollection) => {
    localStorage.setItem("playlists", JSON.stringify(playlists));
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

  const setMode = useCallback((mode: Mode) => {
    setConfig((old) => ({ ...old, mode: mode }));
  }, []);
  const setTheme = useCallback((theme: Theme) => {
    setConfig((old) => ({ ...old, theme: theme }));
  }, []);
  const setFont = useCallback((font: Font) => {
    setConfig((old) => ({ ...old, font: font }));
  }, []);

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
      config,
      setMode,
      setTheme,
      setFont,
      chords,
      playlists,
      setPlaylists,
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
      config,
      setMode,
      setTheme,
      setFont,
      chords,
      playlists,
      setPlaylists,
    ]
  );

  return (
    <GlobalContextProvider value={value}>{children}</GlobalContextProvider>
  );
};

export default GlobalProvider;
