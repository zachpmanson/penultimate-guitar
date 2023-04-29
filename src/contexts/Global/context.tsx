import { Mode, TabLinkDto } from "@/models";
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
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
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
  mode: "Default",
  setMode: () => {},
});

export const GlobalContextProvider = GlobalContext.Provider;

export const useGlobal = () => useContext(GlobalContext);
