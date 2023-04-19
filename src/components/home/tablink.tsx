import { useGlobal } from "@/contexts/Global/context";
import { TabLinkDto } from "@/models";
import Link from "next/link";
import { useState } from "react";
import SaveDialog from "../dialog/savedialog";

type TabLinkProps = {
  tablink: TabLinkDto;
  recent?: boolean;
};
export default function TabLink({ tablink, recent }: TabLinkProps) {
  const { removeSavedTab: removesavedTab, isSaved } = useGlobal();
  const [saveDialogActive, setSaveDialogActive] = useState(false);

  const handleSave = () => {
    if (!recent && isSaved(tablink)) {
      removesavedTab(tablink);
    } else {
      setSaveDialogActive(true);
    }
  };

  return (
    <>
      <div className="w-full flex mx-auto justify-between gap-2">
        <Link
          href={`/tab/${tablink.taburl}`}
          className="w-full text-black no-underline"
        >
          <div className="border-grey-500 bg-white border-2 p-4 rounded-xl  hover:shadow-md transition ease-in-out flex justify-between">
            <div>
              {tablink.name} - {tablink.artist}
              {tablink.version && (
                <span className="font-light text-xs">
                  {" "}
                  {tablink.type && `(${tablink.type})`}
                  (v{tablink.version})
                </span>
              )}
            </div>
          </div>
        </Link>
        <button
          onClick={handleSave}
          className="flex items-center bg-white px-4 text-md text-lg border-grey-500 border-2 rounded-xl hover:shadow-md transition ease-in-out "
        >
          {recent ? "💾" : "❌"}
        </button>
      </div>
      <SaveDialog
        isOpen={saveDialogActive}
        setIsOpen={setSaveDialogActive}
        tab={tablink}
      />
    </>
  );
}
