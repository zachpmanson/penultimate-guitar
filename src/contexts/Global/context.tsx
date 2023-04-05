import { TabDto, TabLinkProps } from "@/models";
import { createContext, useContext } from "react";

export type GlobalContextProps = {
  savedTabs: TabLinkProps[];
  addsavedTab: (newTab: TabLinkProps) => void;
  removesavedTab: (newTab: TabLinkProps) => void;
  issaved: (newTab: TabLinkProps) => boolean;
};

const GlobalContext = createContext<GlobalContextProps>({
  savedTabs: new Array<TabLinkProps>(),
  addsavedTab: () => undefined,
  removesavedTab: () => undefined,
  issaved: () => false,
});

export const GlobalContextProvider = GlobalContext.Provider;

export const useGlobal = () => useContext(GlobalContext);
