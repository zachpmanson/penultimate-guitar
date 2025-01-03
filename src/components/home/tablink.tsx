import { useGlobal } from "@/contexts/Global/context";
import { TabLinkDto } from "@/models/models";
import Link from "next/link";
import { useState } from "react";
import SaveDialog from "../dialog/savedialog";
import PlainButton from "../shared/plainbutton";
import useSavedTabs from "@/hooks/useSavedTabs";
import { BookmarkIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { ROUTE_PREFIX } from "@/constants";

export default function TabLink({
  tablink,
  folder,
  recent,
  prefetch = false,
}: {
  tablink: TabLinkDto;
  folder?: string;
  recent?: boolean;
  prefetch?: boolean;
}) {
  const { removeSavedTab, isSaved, setBestTab } = useSavedTabs();
  const router = useRouter();
  const { mutateAsync: getHighestRatedTabLazy } =
    trpc.tab.getHighestRatedTabLazy.useMutation();
  const [saveDialogActive, setSaveDialogActive] = useState(false);

  const handleSave = () => {
    if (folder && !recent && isSaved(tablink)) {
      removeSavedTab(tablink, folder);
    } else {
      setSaveDialogActive(true);
    }
  };

  return (
    <>
      <div
        className="w-full flex mx-auto justify-between gap-2"
        onMouseOver={(e) => e.stopPropagation()}
      >
        <PlainButton
          href={`${tablink.loadBest ? ROUTE_PREFIX.BEST_TAB : ROUTE_PREFIX.TAB}/${tablink.taburl}`}
          prefetch={prefetch}
          className="w-full text-black dark:text-gray-200 no-underline hover:no-underline active:text-black dark:active:text-white"
        >
          {/* <pre>{JSON.stringify(tablink, null, 2)}</pre> */}
          <span className="font-bold text-sm">{tablink.name}</span> -{" "}
          {tablink.artist}
          {tablink.version && (
            <span className="font-light text-xs">
              {" "}
              {tablink.type && `(${tablink.type})`} (v{tablink.version})
            </span>
          )}
        </PlainButton>
        {/* </Link> */}
        <PlainButton onClick={handleSave}>
          <div className="flex items-center h-full w-4 text-gray-800 dark:text-gray-200">
            {recent || !folder ? (
              <BookmarkIcon className="w-full h-full" />
            ) : (
              <XMarkIcon className="w-full h-full" />
            )}
          </div>
        </PlainButton>
      </div>
      {saveDialogActive && (
        <SaveDialog
          isOpen={saveDialogActive}
          setIsOpen={setSaveDialogActive}
          tab={tablink}
        />
      )}
    </>
  );
}
