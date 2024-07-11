import { TabLinkDto } from "@/models/models";
import { useSavedTabsStore } from "@/state/savedTabs";
import { trpc } from "@/utils/trpc";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef } from "react";

export default function useSavedTabs() {
  const session = useSession();
  const {
    savedTabs,
    addTabLink: addTabLinkLocal,
    removeSavedTab: removeSavedTabLocal,
    setTabFolders: setTabFoldersLocal,
    setUserAllTabLinks,
  } = useSavedTabsStore();

  const userId = session?.data?.user?.id;
  const userKey = userId ?? "@localStorage";

  const notInitialRender = useRef(false);

  const {
    data: tablinks,
    isLoading: isLoadingTabs,
    refetch: refetchTabs,
  } = trpc.user.getTabLinks.useQuery(undefined, {
    enabled: !!userId,
  });
  const addTabLinkApi = trpc.user.addTabLink.useMutation();
  const deleteTabLinkApi = trpc.user.deleteTabLink.useMutation();
  const setTabLinksApi = trpc.user.setTabLinks.useMutation();

  useEffect(() => {
    if (tablinks && userId) setUserAllTabLinks(tablinks, userId);
  }, [userId, tablinks, setUserAllTabLinks]);

  const setTabFolders = useCallback(
    (tabLink: TabLinkDto, folders: string[]) => {
      const userId = session?.data?.user?.id;

      if (userId) {
        setTabLinksApi
          .mutateAsync({
            tab: tabLink,
            folders: folders,
          })
          .then(() => refetchTabs());
      }

      setTabFoldersLocal(tabLink, folders, userId);
    },
    [session, refetchTabs, setTabFoldersLocal, setTabLinksApi]
  );

  const addSavedTab = useCallback(
    (newTab: TabLinkDto) => {
      if (userId) {
        addTabLinkApi
          .mutateAsync({
            newTab: newTab,
            folders: [newTab.folder ?? "Favourites"],
          })
          .then(() => refetchTabs());
      }

      addTabLinkLocal(newTab, userId);
    },
    [userId, addTabLinkApi, addTabLinkLocal, refetchTabs]
  );

  const removeSavedTab = useCallback(
    (tab: TabLinkDto) => {
      if (userId) {
        deleteTabLinkApi.mutateAsync(tab).then(() => refetchTabs());
      }
      removeSavedTabLocal(tab, userId);
    },
    [userId, deleteTabLinkApi, refetchTabs, removeSavedTabLocal]
  );

  const isSaved = useCallback(
    (newTab: TabLinkDto) => {
      let existingIndex = savedTabs[userKey].findIndex(
        (t) => t.taburl === newTab.taburl
      );
      return existingIndex !== -1;
    },
    [savedTabs, userKey]
  );

  return {
    savedTabs: savedTabs[userKey] ?? [],
    isLoadingTabs: !!userId && isLoadingTabs,
    setTabFolders,
    addSavedTab,
    removeSavedTab,
    isSaved,
  };
}
