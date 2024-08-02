import { TabLinkDto } from "@/models/models";
import { useSavedTabsStore } from "@/state/savedTabs";
import { trpc } from "@/utils/trpc";
import { flatMap } from "lodash";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useRef } from "react";

export default function useSavedTabs() {
  const session = useSession();
  const {
    savedTabs,
    addTabLink: addTabLinkLocal,
    removeSavedTab: removeSavedTabLocal,
    setTabFolders: setTabFoldersLocal,
    removeFolder: removeFolderLocal,
    setUserAllFolders: setUserAllTabLinks,
  } = useSavedTabsStore();

  const userId = session?.data?.user?.id;
  const userKey = userId ?? "@localStorage";

  const {
    data: tablinksAndFolders,
    isLoading: isLoadingTabs,
    refetch: refetchTabs,
  } = trpc.user.getTabLinks.useQuery(undefined, {
    enabled: !!userId,
  });

  const addTabLinkApi = trpc.user.addTabLink.useMutation();
  const deleteTabLinkApi = trpc.user.deleteTabLink.useMutation();
  const setTabLinksApi = trpc.user.setTabLinks.useMutation();

  useEffect(() => {
    if (tablinksAndFolders && userId)
      setUserAllTabLinks(tablinksAndFolders, userId);
  }, [userId, tablinksAndFolders, setUserAllTabLinks]);

  const setTabFolders = useCallback(
    (tablink: TabLinkDto, folders: string[]) => {
      const userId = session?.data?.user?.id;
      const cleanFolders = folders.filter((f) => !!f); // for some reason empty slots make it into here

      console.log({ tablink, cleanFolders });

      if (userId) {
        setTabLinksApi
          .mutateAsync({
            tab: tablink,
            folders: cleanFolders,
          })
          .then(() => refetchTabs());
      }

      setTabFoldersLocal(tablink, cleanFolders, userId);
    },
    [session, refetchTabs, setTabFoldersLocal, setTabLinksApi]
  );

  const addSavedTab = useCallback(
    (newTab: TabLinkDto) => {
      if (userId) {
        addTabLinkApi
          .mutateAsync({
            newTab: newTab,
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

  const removeFolder = useCallback(
    (folder: string) => {
      // if (userId) {
      //   deleteFolderApi.mutateAsync(folder).then(() => refetchTabs());
      // }
      // TODO add api
      removeFolderLocal(folder, userId);
    },
    [userId, refetchTabs, removeFolderLocal]
  );

  const isSaved = useCallback(
    (newTab: TabLinkDto) => {
      let existingIndex = savedTabs[userKey]
        .flatMap((f) => f.tabs)
        .findIndex((t) => t.taburl === newTab.taburl);
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
    removeFolder,
  };
}
