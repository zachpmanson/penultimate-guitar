import { useGlobal } from "@/contexts/Global/context";
import { TabLinkDto } from "@/models";
import Link from "next/link";
import { useState } from "react";
import SaveDialog from "../dialog/savedialog";
import PlainButton from "../shared/plainbutton";

type TabLinkProps = {
  tablink: TabLinkDto;
  recent?: boolean;
};
export default function TabLink({ tablink, recent }: TabLinkProps) {
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
      <div className="w-full flex mx-auto justify-between gap-2">
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
                {tablink.type && `(${tablink.type})`}
                (v{tablink.version})
              </span>
            )}
          </PlainButton>
        </Link>
        <PlainButton onClick={handleSave}>
          <div className="flex items-center h-full">{recent ? "💾" : "❌"}</div>
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
