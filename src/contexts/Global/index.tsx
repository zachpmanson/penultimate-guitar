import { ChordDB } from "@/models/chorddb.models";
import { PlaylistCollection } from "@/models/models";
import { useAuthStore } from "@/state/auth";
import { useConfigStore } from "@/state/config";
import { useSession } from "next-auth/react";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { GlobalContextProps, GlobalContextProvider } from "./context";

const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [searchText, setSearchText] = useState<string>("");
  const [playlists, setPlaylists] = useState<PlaylistCollection>({});
  const { guitarChords, setGuitarChords } = useConfigStore();

  const session = useSession();
  const userId = session?.data?.user?.id;
  const { setUserId } = useAuthStore();

  useEffect(() => {
    if (userId) setUserId(userId);
    else setUserId(undefined);
  }, [userId]);

  useEffect(() => {
    if (!guitarChords) {
      fetch("/chords/guitar.json", {
        method: "GET",
      })
        .then((res) => res.json())
        .then((res: ChordDB.GuitarChords) => {
          setGuitarChords(res);
        });
    }
    getPlaylists();
  }, []);

  useEffect(() => {
    updatePlaylists(playlists);
  }, [playlists]);

  const getPlaylists = () => {
    const parsedPlaylists = JSON.parse(
      localStorage.getItem("playlists") ?? "{}"
    ) as PlaylistCollection;
    setPlaylists(parsedPlaylists);
  };

  const updatePlaylists = (playlists: PlaylistCollection) => {
    localStorage.setItem("playlists", JSON.stringify(playlists));
  };

  const value: GlobalContextProps = useMemo(
    () => ({
      searchText,
      setSearchText,
      playlists,
      setPlaylists,
    }),
    [searchText, setSearchText, playlists, setPlaylists]
  );

  return (
    <GlobalContextProvider value={value}>{children}</GlobalContextProvider>
  );
};

export default GlobalProvider;
