import { TabLinkDto } from "@/models";
import { createContext, Dispatch, SetStateAction, useContext } from "react";

export type GlobalContextProps = {
  savedTabs: TabLinkDto[];
  setTabFolders: (newTab: TabLinkDto, folders: string[]) => void;
  removesavedTab: (newTab: TabLinkDto) => void;
  isSaved: (newTab: TabLinkDto) => boolean;
  globalLoading: string;
  setGlobalLoading: Dispatch<SetStateAction<string>>;
};

const GlobalContext = createContext<GlobalContextProps>({
  savedTabs: new Array<TabLinkDto>(),
  setTabFolders: () => undefined,
  removesavedTab: () => undefined,
  isSaved: () => false,
  globalLoading: "",
  setGlobalLoading: () => {},
});

export const GlobalContextProvider = GlobalContext.Provider;

export const useGlobal = () => useContext(GlobalContext);
