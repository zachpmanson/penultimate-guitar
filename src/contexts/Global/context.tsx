import { ChordDB } from "@/models/chorddb.models";
import {
  Config,
  defaultConfig,
  Font,
  Mode,
  PlaylistCollection,
  TabLinkDto,
  Theme,
} from "@/models/models";
import { createContext, Dispatch, SetStateAction, useContext } from "react";

export type GlobalContextProps = {
  savedTabs: TabLinkDto[];
  setTabFolders: (newTab: TabLinkDto, folders: string[]) => void;
  addSavedTab: (newTab: TabLinkDto) => void;
  removeSavedTab: (newTab: TabLinkDto) => void;
  isSaved: (newTab: TabLinkDto) => boolean;
  searchText: string;
  setSearchText: Dispatch<SetStateAction<string>>;
  globalLoading: string;
  setGlobalLoading: Dispatch<SetStateAction<string>>;
  config: Config;
  setMode: (mode: Mode) => void;
  setTheme: (theme: Theme) => void;
  setFont: (font: Font) => void;
  chords?: ChordDB.GuitarChords;
  playlists: PlaylistCollection;
  setPlaylists: Dispatch<SetStateAction<PlaylistCollection>>;
};

const GlobalContext = createContext<GlobalContextProps>({
  savedTabs: new Array<TabLinkDto>(),
  setTabFolders: () => undefined,
  addSavedTab: () => undefined,
  removeSavedTab: () => undefined,
  isSaved: () => false,
  searchText: "",
  setSearchText: () => {},
  globalLoading: "",
  setGlobalLoading: () => {},
  config: defaultConfig,
  setMode: (_mode: Mode) => {},
  setTheme: (_theme: Theme) => {},
  setFont: (_font: Font) => {},
  playlists: {},
  setPlaylists: () => {},
});

export const GlobalContextProvider = GlobalContext.Provider;

export const useGlobal = () => useContext(GlobalContext);
