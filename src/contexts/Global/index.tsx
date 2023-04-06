import { TabLinkProps } from "@/models";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { GlobalContextProps, GlobalContextProvider } from "./context";

const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [savedTabs, setsavedTabs] = useState<TabLinkProps[]>([]);

  useEffect(() => {
    getSavedTabs();
  }, []);

  const getSavedTabs = () => {
    const parsedTabs = JSON.parse(
      localStorage.getItem("savedTabs") ?? "[]"
    ) as TabLinkProps[];
    setsavedTabs(parsedTabs.filter((t) => t.name && t.artist));
  };

  const updateLocalSaves = (saves: TabLinkProps[]) =>
    localStorage.setItem("savedTabs", JSON.stringify(saves));

  const addsavedTab = useCallback(
    (newTab: TabLinkProps) => {
      let existingIndex = savedTabs.findIndex(
        (t) => t.taburl === newTab.taburl
      );
      if (existingIndex === -1) {
        let tempTabs = [...savedTabs, newTab];

        setsavedTabs(tempTabs);
        updateLocalSaves(tempTabs);
      }
    },
    [savedTabs]
  );

  const removesavedTab = useCallback(
    (newTab: TabLinkProps) => {
      let existingIndex = savedTabs.findIndex(
        (t) => t.taburl === newTab.taburl
      );
      if (existingIndex !== -1) {
        let tempTabs = [...savedTabs];
        tempTabs.splice(existingIndex, 1);
        setsavedTabs(tempTabs);
        updateLocalSaves(tempTabs);
      }
    },
    [savedTabs]
  );

  const issaved = useCallback(
    (newTab: TabLinkProps) => {
      let existingIndex = savedTabs.findIndex(
        (t) => t.taburl === newTab.taburl
      );
      return existingIndex !== -1;
    },
    [savedTabs]
  );

  const value: GlobalContextProps = useMemo(
    () => ({
      addsavedTab: addsavedTab,
      removesavedTab: removesavedTab,
      savedTabs: savedTabs,
      issaved: issaved,
    }),
    [savedTabs, addsavedTab, removesavedTab, issaved]
  );

  return (
    <GlobalContextProvider value={value}>{children}</GlobalContextProvider>
  );
};

export default GlobalProvider;
