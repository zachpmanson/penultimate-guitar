import { useGlobal } from "@/contexts/Global/context";
import { TabLinkDto } from "@/models/models";
import Link from "next/link";
import { useState } from "react";
import SaveDialog from "../dialog/savedialog";
import PlainButton from "../shared/plainbutton";

export default function TabLink({
  tablink,
  recent,
}: {
  tablink: TabLinkDto;
  recent?: boolean;
}) {
  const { removeSavedTab, isSaved } = useGlobal();
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
          className="w-full text-black no-underline hover:no-underline active:text-black"
          prefetch={false}
        >
          <PlainButton>
            <span className="font-bold">{tablink.name}</span> - {tablink.artist}
            {tablink.version && (
              <span className="font-light text-xs">
                {" "}
                {tablink.type && `(${tablink.type})`} (v{tablink.version})
              </span>
            )}
          </PlainButton>
        </Link>
        <PlainButton onClick={handleSave}>
          <div className="flex items-center h-full w-4">
            {recent ? "💾" : "❌"}
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
