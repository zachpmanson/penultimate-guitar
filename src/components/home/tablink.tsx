import { useGlobal } from "@/contexts/Global/context";
import { TabLinkDto } from "@/models/models";
import Link from "next/link";
import { useState } from "react";
import SaveDialog from "../dialog/savedialog";
import PlainButton from "../shared/plainbutton";
import useSavedTabs from "@/hooks/useSavedTabs";
import { BookmarkIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function TabLink({
  tablink,
  recent,
}: {
  tablink: TabLinkDto;
  recent?: boolean;
}) {
  const { removeSavedTab, isSaved } = useSavedTabs();
  const [saveDialogActive, setSaveDialogActive] = useState(false);

  const handleSave = () => {
    if (!recent && isSaved(tablink)) {
      removeSavedTab(tablink);
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
          href={`/tab/${tablink.taburl}`}
          className="w-full text-black dark:text-gray-200 no-underline hover:no-underline active:text-black dark:active:text-white"
          prefetch={false}
        >
          <PlainButton>
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
            {recent ? (
              <BookmarkIcon className="w-full h-full" />
            ) : (
              <XMarkIcon className="w-full h-full" />
            )}
          </div>
        </PlainButton>
      </div>
      <SaveDialog
        isOpen={saveDialogActive}
        setIsOpen={setSaveDialogActive}
        tab={tablink}
      />
    </>
  );
}
