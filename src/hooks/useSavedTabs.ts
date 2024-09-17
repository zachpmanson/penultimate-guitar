import { AltVersion, TabLinkDto } from "@/models/models";
import { useSavedTabsStore } from "@/state/savedTabs";
import { trpc } from "@/utils/trpc";
import { useSession } from "next-auth/react";
import { useCallback, useEffect } from "react";

export default function useSavedTabs() {
  const session = useSession();
  const {
    savedTabs,
    addTabLink: addTabLinkLocal,
    removeSavedTab: removeSavedTabLocal,
    setTabFolders: setTabFoldersLocal,
    removeFolder: removeFolderLocal,
    setUserAllFolders: setUserAllTabLinks,
    setBestTab: setBestTabLocal,
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
  const removeFolderApi = trpc.user.deleteFolder.useMutation();
  const setBestTabApi = trpc.user.setBestTab.useMutation();

  useEffect(() => {
    if (tablinksAndFolders && userId)
      setUserAllTabLinks(tablinksAndFolders, userId);
  }, [userId, tablinksAndFolders, setUserAllTabLinks]);

  const setTabFolders = useCallback(
    (tablink: TabLinkDto, folders: string[]) => {
      const userId = session?.data?.user?.id;

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
    [session, refetchTabs, setTabFoldersLocal, setTabLinksApi]
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
    [userId, addTabLinkApi, addTabLinkLocal, refetchTabs]
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
    [userId, deleteTabLinkApi, refetchTabs, removeSavedTabLocal]
  );

  const removeFolder = useCallback(
    (folder: string) => {
      if (userId) {
        removeFolderApi
          .mutateAsync({ folderName: folder })
          .then(() => refetchTabs());
      } else {
        removeFolderLocal(folder, userId);
      }
    },
    [userId, refetchTabs, removeFolderLocal]
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
    [userId, setBestTabLocal]
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
    isLoadingTabs: (!!userId && isLoadingTabs) || session.status === "loading",
    setTabFolders,
    addSavedTab,
    removeSavedTab,
    isSaved,
    removeFolder,
    setBestTab,
  };
}
