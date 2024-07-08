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

  // const getSavedTabs = useCallback(() => {
  //   const parsedTabs = JSON.parse(
  //     localStorage.getItem("savedUserTabs") ?? "{}"
  //   ) as SavedUserTabLinks;

  //   if (userId && tablinks) {
  //     setSavedTabs(tablinks);
  //   } else {
  //     setSavedTabs(
  //       (parsedTabs[userId ?? "@localStorage"] ?? []).filter(
  //         (t) => t.name && t.artist
  //       )
  //     );
  //   }
  // }, [tablinks, userId]);

  // useEffect(() => {
  //   getSavedTabs();
  // }, [getSavedTabs]);

  useEffect(() => {
    if (tablinks && userId) setUserAllTabLinks(tablinks, userId);
  }, [userId, tablinks]);

  // const updateLocalSaves = useCallback(
  //   (saves: TabLinkDto[]) => {
  //     const parsedTabs = JSON.parse(
  //       localStorage.getItem("savedUserTabs") ?? "{}"
  //     ) as SavedUserTabLinks;

  //     localStorage.setItem(
  //       "savedUserTabs",
  //       JSON.stringify({ ...parsedTabs, [userId ?? "@localStorage"]: saves })
  //     );
  //   },
  //   [userId]
  // );
  // console.log("savedTabs", savedTabs);

  // Save all changes to in memory savedTabs to localStorage
  // useEffect(() => {
  //   console.log("saving tabs", savedTabs);
  //   if (notInitialRender.current) {
  //     // updateLocalSaves(savedTabs);
  //   } else {
  //     notInitialRender.current = true;
  //   }
  // }, [savedTabs, updateLocalSaves]);

  const setTabFolders = useCallback(
    (tabLink: TabLinkDto, folders: string[]) => {
      const userId = session?.data?.user?.id;

      if (userId) {
        setTabLinksApi.mutate({
          tab: tabLink,
          folders: folders,
        });
        refetchTabs();
      }

      setTabFoldersLocal(tabLink, folders, userId);
    },
    [session, addTabLinkApi, refetchTabs, setTabFoldersLocal]
  );

  const addSavedTab = useCallback(
    (newTab: TabLinkDto) => {
      if (userId) {
        addTabLinkApi.mutate({
          newTab: newTab,
          folders: [newTab.folder ?? "Favourites"],
        });
        refetchTabs();
      }

      addTabLinkLocal(newTab, userId);
    },
    [userId, addTabLinkApi, addTabLinkLocal]
  );

  const removeSavedTab = useCallback(
    (tab: TabLinkDto) => {
      if (userId) {
        deleteTabLinkApi.mutate(tab);
        refetchTabs();
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
    [savedTabs]
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
