import { useGlobal } from "@/contexts/Global/context";
import { TabDto, TabLinkProps } from "@/models";
import Link from "next/link";
import { useState } from "react";
import SaveDialog from "../save/saveDialog";

export default function TabLink(tabLink: TabLinkProps) {
  const { removesavedTab, issaved } = useGlobal();
  const [saveDialogActive, setSaveDialogActive] = useState(false);

  const handleSave = () => {
    if (issaved(tabLink)) {
      removesavedTab(tabLink);
    } else {
      setSaveDialogActive(true);
    }
  };

  return (
    <>
      <div className="w-full flex mx-auto justify-between gap-2">
        <Link
          href={`/tab/${tabLink.taburl}`}
          className="w-full text-black no-underline"
        >
          <div className="border-grey-500 bg-white border-2 p-4 rounded-xl  hover:shadow-md transition ease-in-out flex justify-between">
            <div>
              {tabLink.name} - {tabLink.artist}
              {tabLink.version && (
                <span className="font-light text-xs">
                  {" "}
                  (v{tabLink.version})
                </span>
              )}
            </div>
          </div>
        </Link>
        <button
          onClick={handleSave}
          className="flex items-center bg-white px-4 text-md text-lg border-grey-500 border-2 rounded-xl hover:shadow-md transition ease-in-out "
        >
          {issaved(tabLink) ? "❌" : "💾"}
        </button>
      </div>
      <SaveDialog
        isOpen={saveDialogActive}
        setIsOpen={setSaveDialogActive}
        tab={tabLink}
      />
    </>
  );
}
