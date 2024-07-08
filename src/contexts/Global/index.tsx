import { ChordDB } from "@/models/chorddb.models";
import { Mode, PlaylistCollection } from "@/models/models";
import { useAuthStore } from "@/state/auth";
import { useSession } from "next-auth/react";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { GlobalContextProps, GlobalContextProvider } from "./context";

const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [searchText, setSearchText] = useState<string>("");
  const [globalLoading, setGlobalLoading] = useState("");
  const [playlists, setPlaylists] = useState<PlaylistCollection>({});
  const [mode, setMode] = useState<Mode>("default");
  const [chords, setChords] = useState<ChordDB.GuitarChords>();

  const session = useSession();
  const userId = session?.data?.user?.id;
  const { setUserId } = useAuthStore();

  useEffect(() => {
    if (userId) setUserId(userId);
    else setUserId("");
  }, [userId]);

  useEffect(() => {
    getChords();
    getPlaylists();
  }, []);

  useEffect(() => {
    updateLocalMode(mode);
  }, [mode]);

  useEffect(() => {
    updatePlaylists(playlists);
  }, [playlists]);

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

  const updatePlaylists = (playlists: PlaylistCollection) => {
    localStorage.setItem("playlists", JSON.stringify(playlists));
  };

  const value: GlobalContextProps = useMemo(
    () => ({
      searchText,
      setSearchText,
      globalLoading,
      setGlobalLoading,
      chords,
      playlists,
      setPlaylists,
    }),
    [
      searchText,
      setSearchText,
      globalLoading,
      setGlobalLoading,
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
