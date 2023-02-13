import { TabDto } from "@/models";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { GlobalContextProps, GlobalContextProvider } from "./context";

const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [pinnedTabs, setPinnedTabs] = useState<TabDto[]>([]);

  useEffect(() => {
    setPinnedTabs(JSON.parse(localStorage.getItem("pinnedTabs") ?? "[]"));
  }, []);

  const updateLocalPins = (pins: TabDto[]) =>
    localStorage.setItem("pinnedTabs", JSON.stringify(pins));

  const addPinnedTab = useCallback(
    (newTab: TabDto) => {
      let existingIndex = pinnedTabs.findIndex(
        (t) => t.taburl === newTab.taburl
      );
      if (existingIndex === -1) {
        let tempTabs = [...pinnedTabs, newTab];

        setPinnedTabs(tempTabs);
        updateLocalPins(tempTabs);
      }
    },
    [pinnedTabs]
  );

  const removePinnedTab = useCallback(
    (newTab: TabDto) => {
      let existingIndex = pinnedTabs.findIndex(
        (t) => t.taburl === newTab.taburl
      );
      if (existingIndex !== -1) {
        let tempTabs = [...pinnedTabs];
        tempTabs.splice(existingIndex, 1);
        setPinnedTabs(tempTabs);
        updateLocalPins(tempTabs);
      }
    },
    [pinnedTabs]
  );

  const isPinned = useCallback(
    (newTab: TabDto) => {
      let existingIndex = pinnedTabs.findIndex(
        (t) => t.taburl === newTab.taburl
      );
      return existingIndex !== -1;
    },
    [pinnedTabs]
  );

  const value: GlobalContextProps = useMemo(
    () => ({
      addPinnedTab: addPinnedTab,
      removePinnedTab: removePinnedTab,
      pinnedTabs: pinnedTabs,
      isPinned: isPinned,
    }),
    [pinnedTabs, addPinnedTab, removePinnedTab, isPinned]
  );

  return (
    <GlobalContextProvider value={value}>{children}</GlobalContextProvider>
  );
};

export default GlobalProvider;
