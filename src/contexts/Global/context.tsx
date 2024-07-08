import { ChordDB } from "@/models/chorddb.models";
import { Mode, PlaylistCollection } from "@/models/models";
import { Dispatch, SetStateAction, createContext, useContext } from "react";

export type GlobalContextProps = {
  searchText: string;
  setSearchText: Dispatch<SetStateAction<string>>;
  globalLoading: string;
  setGlobalLoading: Dispatch<SetStateAction<string>>;
  chords?: ChordDB.GuitarChords;
  playlists: PlaylistCollection;
  setPlaylists: Dispatch<SetStateAction<PlaylistCollection>>;
};

const GlobalContext = createContext<GlobalContextProps>({
  searchText: "",
  setSearchText: () => {},
  globalLoading: "",
  setGlobalLoading: () => {},
  playlists: {},
  setPlaylists: () => {},
});

export const GlobalContextProvider = GlobalContext.Provider;

export const useGlobal = () => useContext(GlobalContext);
