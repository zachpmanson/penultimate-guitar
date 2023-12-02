import {
  Mode,
  PlaylistCollection,
  SavedUserTabLinks,
  TabLinkDto,
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
import { useSession } from "next-auth/react";
import { Session } from "next-auth";

const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [savedTabs, setSavedTabs] = useState<TabLinkDto[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [globalLoading, setGlobalLoading] = useState("");
  const [playlists, setPlaylists] = useState<PlaylistCollection>({});
  const [mode, setMode] = useState<Mode>("default");
  const [chords, setChords] = useState<ChordDB.GuitarChords>();

  const session = useSession();

  const notInitialRender = useRef(false);

  useEffect(() => {
    getSavedTabs();
    getLocalMode();
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
    updateLocalMode(mode);
  }, [mode]);

  useEffect(() => {
    updatePlaylists(playlists);
  }, [playlists]);

  useEffect(() => {
    const userId = (session?.data as Session & { token: any })?.token.account
      ?.providerAccountId;
    getSavedTabs(userId);
  }, [session]);

  const getSavedTabs = (userId?: string) => {
    const parsedTabs = JSON.parse(
      localStorage.getItem("savedUserTabs") ?? "{}"
    ) as SavedUserTabLinks;

    console.log("getSavedTabs", userId);
    if (userId) {
      fetch("/api/user/tablinks", {
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((res) => {
          setSavedTabs(res);
          // console.log(JSON.stringify(res, null, 2));
        });
    } else {
      setSavedTabs(
        (parsedTabs[userId ?? "@localStorage"] ?? []).filter(
          (t) => t.name && t.artist
        )
      );
    }
  };

  const getLocalMode = () => {
    const parsedMode = (localStorage.getItem("mode") ?? "Default") as Mode;
    setMode(parsedMode);
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

  const updateLocalMode = (mode: Mode) => localStorage.setItem("mode", mode);

  const updateLocalSaves = (saves: TabLinkDto[]) => {
    const userId = (session?.data as Session & { token: any })?.token.account
      ?.providerAccountId;

    const parsedTabs = JSON.parse(
      localStorage.getItem("savedUserTabs") ?? "{}"
    ) as SavedUserTabLinks;

    localStorage.setItem(
      "savedUserTabs",
      JSON.stringify({ ...parsedTabs, [userId ?? "@localStorage"]: saves })
    );
  };

  const updatePlaylists = (playlists: PlaylistCollection) => {
    localStorage.setItem("playlists", JSON.stringify(playlists));
  };

  // removes all taburl in all folders, readds taburl to folder in string[]
  //
  const setTabFolders = useCallback(
    (tabLink: TabLinkDto, folders: string[]) => {
      const userId = (session?.data as Session & { token: any })?.token.account
        ?.providerAccountId;

      if (userId) {
        fetch("/api/user/tablinks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newTab: tabLink,
            folders: folders,
          }),
        }).then((res) => {
          console.log(JSON.stringify(res, null, 2));
        });
      }

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
    [session]
  );

  const addSavedTab = useCallback(
    (newTab: TabLinkDto) => {
      const userId = (session?.data as Session & { token: any })?.token.account
        ?.providerAccountId;

      if (userId) {
        fetch("/api/user/tablinks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newTab: newTab,
            folders: [newTab.folder ?? "Favourites"],
          }),
        }).then((res) => {
          console.log(JSON.stringify(res, null, 2));
        });
      }

      setSavedTabs((old) => {
        let existingIndex = old.findIndex(
          (t) => t.taburl === newTab.taburl && t.folder === newTab.folder
        );
        return existingIndex === -1 ? [...old, newTab] : old;
      });
    },
    [session]
  );

  const removeSavedTab = useCallback(
    (tab: TabLinkDto) => {
      console.log("removeSavedTab", tab);
      const userId = (session?.data as Session & { token: any })?.token.account
        ?.providerAccountId;
      if (userId) {
        console.log("removeSavedTab", tab);
        fetch("/api/user/tablinks", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(tab),
        }).then((res) => {
          console.log(JSON.stringify(res, null, 2));
        });
      }
      setSavedTabs((old) => {
        let newTabs = old.filter(
          (t) => !(t.taburl === tab.taburl && t.folder === tab.folder)
        );
        return newTabs;
      });
    },
    [session]
  );

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
      mode,
      setMode,
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
