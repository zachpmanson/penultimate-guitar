import { ChordDB } from "@/models/chorddb.models";
import { Mode, PlaylistCollection } from "@/models/models";
import { Dispatch, SetStateAction, createContext, useContext } from "react";

export type GlobalContextProps = {
  playlists: PlaylistCollection;
  setPlaylists: Dispatch<SetStateAction<PlaylistCollection>>;
};

const GlobalContext = createContext<GlobalContextProps>({
  playlists: {},
  setPlaylists: () => {},
});

export const GlobalContextProvider = GlobalContext.Provider;

export const useGlobal = () => useContext(GlobalContext);
