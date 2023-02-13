import { TabDto } from "@/models";
import { createContext, useContext } from "react";

export type GlobalContextProps = {
  pinnedTabs: TabDto[];
  addPinnedTab: (newTab: TabDto) => void;
  removePinnedTab: (newTab: TabDto) => void;
};

const GlobalContext = createContext<GlobalContextProps>({
  pinnedTabs: new Array<TabDto>(),
  addPinnedTab: () => undefined,
  removePinnedTab: () => undefined,
});

export const GlobalContextProvider = GlobalContext.Provider;

export const useGlobal = () => useContext(GlobalContext);
