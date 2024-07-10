import { useGlobal } from "@/contexts/Global/context";
import { TabLinkDto } from "@/models/models";
import { Dialog } from "@headlessui/react";
import {
  ChangeEvent,
  Dispatch,
  KeyboardEventHandler,
  SetStateAction,
  useEffect,
  useState,
  KeyboardEvent,
} from "react";
import DialogButton from "./dialogbutton";
import useSavedTabs from "@/hooks/useSavedTabs";

type SaveDialogProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  tab: TabLinkDto;
};

export default function SaveDialog({
  isOpen,
  setIsOpen,
  tab,
}: SaveDialogProps) {
  const { setTabFolders, savedTabs } = useSavedTabs();
  const [currentFolders, setCurrentFolders] = useState<string[]>([]);
  const [addingNew, setAddingNew] = useState(false);

  const [folders, setFolders] = useState(["Favourites"]);
  const [newFolder, setNewFolder] = useState("");

  useEffect(() => setAddingNew(false), [isOpen]);

  useEffect(() => {
    const folderNames = [
      ...Array.from(
        new Set([
          "Favourites",
          ...savedTabs.map((t) => t.folder ?? "Favourites"),
        ])
      ),
    ];
    setFolders(folderNames);

    let currentFolderNames = savedTabs
      .filter((t) => t.taburl === tab.taburl)
      .map((t) => t.folder);

    let actualFolderNames: string[] = [];
    for (let name of currentFolderNames) {
      if (!!name) {
        actualFolderNames.push(name);
      }
    }

    setCurrentFolders(actualFolderNames);
  }, [savedTabs, tab.taburl]);

  const save = () => {
    setTabFolders(tab, currentFolders);
    setIsOpen(false);
  };

  const handleFolderChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (currentFolders.includes(event.target.value)) {
      setCurrentFolders((old) => old.filter((f) => f !== event.target.value));
    } else {
      setCurrentFolders((old) => [...old, event.target.value]);
    }
  };

  const handleNewFolderChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewFolder(event.target.value);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") addNew();
  };

  const addNew = () => {
    let trimmedName = newFolder.trim();
    if (!!trimmedName && trimmedName.length < 20) {
      setFolders((old) => [...old, trimmedName]);
      setCurrentFolders((old) => [...old, trimmedName]);
    }
    setAddingNew(false);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="relative z-50"
    >
      {currentFolders}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-xs rounded bg-white p-4">
          <Dialog.Title>Save tab to folder</Dialog.Title>
          <Dialog.Description></Dialog.Description>
          <hr />
          <div className="flex flex-col">
            {folders.map((f, i) => (
              <label key={i} className="w-full text-lg">
                <input
                  type="checkbox"
                  value={f}
                  name={f}
                  checked={currentFolders.includes(f)}
                  onChange={handleFolderChange}
                />{" "}
                {f}
              </label>
            ))}
          </div>
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex justify-between">
              {addingNew ? (
                <div className="w-full">
                  <input
                    autoFocus
                    className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 "
                    type="text"
                    placeholder="New folder..."
                    onBlur={addNew}
                    onKeyDown={handleKeyDown}
                    onChange={handleNewFolderChange}
                  />
                </div>
              ) : (
                <>
                  <div>
                    <DialogButton
                      onClick={() => setAddingNew(true)}
                      disabled={false}
                    >
                      New
                    </DialogButton>
                  </div>
                  <div className="flex gap-4">
                    <DialogButton onClick={save} disabled={false}>
                      Save
                    </DialogButton>
                  </div>
                </>
              )}
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
