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

export default function TabLink({
  tablink,
  folder,
  recent,
}: {
  tablink: TabLinkDto;
  folder?: string;
  recent?: boolean;
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
        <Link
          // this allows mouse3 to still open the link in a new tab even if mouse1 overrides
          href={`/${tablink.loadBest ? "best" : "tab"}/${tablink.taburl}`}
          onMouseDown={(e) => {
            if (e.button === 1 && tablink.loadBest) {
              getHighestRatedTabLazy(tablink.taburl).then((ranked) => {
                setBestTab(tablink.taburl, ranked[0]);
              });
            }
          }}
          onClick={(e) => {
            if (tablink.loadBest) {
              e.preventDefault();
              getHighestRatedTabLazy(tablink.taburl).then((ranked) => {
                router.push("/tab/" + ranked[0].taburl);
                setBestTab(tablink.taburl, ranked[0]);
              });
            }
          }}
          className="w-full text-black dark:text-gray-200 no-underline hover:no-underline active:text-black dark:active:text-white"
          prefetch={false}
        >
          <PlainButton>
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
        </Link>
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
