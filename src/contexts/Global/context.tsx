import { TabDto, TabLinkProps } from "@/models";
import { createContext, useContext } from "react";

export type GlobalContextProps = {
  pinnedTabs: TabLinkProps[];
  addPinnedTab: (newTab: TabLinkProps) => void;
  removePinnedTab: (newTab: TabLinkProps) => void;
  isPinned: (newTab: TabLinkProps) => boolean;
};

const GlobalContext = createContext<GlobalContextProps>({
  pinnedTabs: new Array<TabLinkProps>(),
  addPinnedTab: () => undefined,
  removePinnedTab: () => undefined,
  isPinned: () => false,
});

export const GlobalContextProvider = GlobalContext.Provider;

export const useGlobal = () => useContext(GlobalContext);
