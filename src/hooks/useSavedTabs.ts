import { AltVersion, TabLinkDto } from "@/models/models";
import { useSavedTabsStore } from "@/state/savedTabs";
import { trpc } from "@/utils/trpc";
import useUser from "@/hooks/useUser";
import { useCallback, useEffect, useMemo } from "react";

export default function useSavedTabs() {
  const { user } = useUser();
  const {
    savedTabs,
    addTabLink: addTabLinkLocal,
    removeSavedTab: removeSavedTabLocal,
    setTabFolders: setTabFoldersLocal,
    removeFolder: removeFolderLocal,
    setUserAllFolders: setUserAllTabLinks,
    setBestTab: setBestTabLocal,
    setFolderOpen: setFolderOpenLocal,
  } = useSavedTabsStore();

  const userId = user;
  const userKey = userId ?? "@localStorage";

  const {
    data: tablinksAndFolders,
    isLoading: isLoadingTabs,
    isFetching: isFetchingTabs,
    refetch: refetchTabs,
  } = trpc.user.getTabLinks.useQuery(undefined, {
    enabled: !!userId,
  });

  const addTabLinkApi = trpc.user.addTabLink.useMutation();
  const deleteTabLinkApi = trpc.user.deleteTabLink.useMutation();
  const setTabLinksApi = trpc.user.setTabLinks.useMutation();
  const removeFolderApi = trpc.user.deleteFolder.useMutation();
  const setBestTabApi = trpc.user.setBestTab.useMutation();

  useEffect(() => {
    if (tablinksAndFolders && userId) setUserAllTabLinks(tablinksAndFolders, userId);
  }, [userId, tablinksAndFolders, setUserAllTabLinks]);

  const setTabFolders = useCallback(
    (tablink: TabLinkDto, folders: string[]) => {
      // unpack here because empty slots somehow end up in the folders array without

      if (userId) {
        setTabLinksApi
          .mutateAsync({
            tab: tablink,
            // unpack here because empty slots somehow end up in the folders array without
            folders: [...folders],
          })
          .then(() => refetchTabs());
        // local storage will get updated on the refetch
      } else {
        console.log("setTabFoldersLocal", { tablink, folders, userId });
        setTabFoldersLocal(tablink, [...folders], userKey);
      }
    },
    [user, userKey, refetchTabs, setTabFoldersLocal, setTabLinksApi]
  );

  const addSavedTab = useCallback(
    (newTab: TabLinkDto, folderName: string) => {
      if (userId) {
        addTabLinkApi
          .mutateAsync({
            newTab: { ...newTab, folder: folderName },
          })
          .then(() => refetchTabs());
      } else {
        addTabLinkLocal(newTab, userKey, folderName);
      }
    },
    [userId, userKey, addTabLinkApi, addTabLinkLocal, refetchTabs]
  );

  const removeSavedTab = useCallback(
    (tab: TabLinkDto, folder: string) => {
      if (userId) {
        deleteTabLinkApi
          .mutateAsync({
            taburl: tab.taburl,
            folderName: folder,
          })
          .then(() => refetchTabs());
      } else {
        removeSavedTabLocal(tab, userKey, folder);
      }
    },
    [userId, userKey, deleteTabLinkApi, refetchTabs, removeSavedTabLocal]
  );

  const removeFolder = useCallback(
    (folder: string) => {
      if (userId) {
        removeFolderApi.mutateAsync({ folderName: folder }).then(() => refetchTabs());
      } else {
        removeFolderLocal(folder, userId ?? undefined);
      }
    },
    [userId, removeFolderApi, refetchTabs, removeFolderLocal]
  );

  const setBestTab = useCallback(
    (oldTaburl: string, newTab: AltVersion) => {
      if (userId) {
        setBestTabApi
          .mutateAsync({
            oldTaburl,
            newTab,
          })
          .then(() => refetchTabs());
      } else {
        setBestTabLocal(userKey, oldTaburl, newTab);
      }
    },
    [userKey, userId, setBestTabLocal, refetchTabs, setBestTabApi]
  );

  const setFolderOpen = useCallback(
    (folderName: string, isOpen: boolean) => {
      if (userKey) {
        setFolderOpenLocal(userKey, folderName, isOpen);
      }
    },
    [userKey, setFolderOpenLocal, refetchTabs]
  );

  const isSaved = useCallback(
    (newTab: TabLinkDto) => {
      let existingIndex = savedTabs[userKey].flatMap((f) => f.tabs).findIndex((t) => t.taburl === newTab.taburl);
      return existingIndex !== -1;
    },
    [savedTabs, userKey]
  );

  const flatTabs = savedTabs[userKey]?.flatMap((f) => f.tabs) ?? [];

  return {
    savedTabs: savedTabs[userKey] ?? [],
    flatTabs,
    isLoadingTabs: !!userId && isLoadingTabs && !savedTabs[userKey],
    isFetchingTabs: !!userId && isFetchingTabs,
    setTabFolders,
    addSavedTab,
    removeSavedTab,
    isSaved,
    removeFolder,
    setBestTab,
    setFolderOpen: setFolderOpen,
  };
}
