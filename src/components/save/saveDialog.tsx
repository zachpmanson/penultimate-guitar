import { useGlobal } from "@/contexts/Global/context";
import { TabLinkProps } from "@/models";
import { Dialog } from "@headlessui/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import DialogButton from "./DialogButton";

type SaveDialogProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  tab: TabLinkProps;
};

export function SaveDialog({ isOpen, setIsOpen, tab }: SaveDialogProps) {
  const { addsavedTab, savedTabs } = useGlobal();
  const [currentFolder, setCurrentFolder] = useState(tab.folder);
  const [addingNew, setAddingNew] = useState(false);
  const folderNames = [
    ...new Set(Object.values(savedTabs).map((t) => t.folder ?? "Favourites")),
  ];
  const [folders, setFolders] = useState(folderNames);
  const [newFolder, setNewFolder] = useState("");

  useEffect(() => setAddingNew(false), [isOpen]);

  const save = () => {
    addsavedTab({ ...tab, folder: currentFolder });
    setIsOpen(false);
  };

  const handleFolderChange = (event) => {
    setCurrentFolder(event.target.value);
  };

  const handleNewFolderChange = (event) => {
    setNewFolder(event.target.value);
  };

  const addNew = () => {
    setFolders((old) => [...old, newFolder]);
    setAddingNew(false);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-xs rounded bg-white p-4">
          <Dialog.Title>Save Tab to Folder</Dialog.Title>
          <Dialog.Description>
            <div className="my-4 flex flex-col">
              {folders.map((f, i) => (
                <label key={i} className="w-full">
                  <input
                    type="radio"
                    value={f}
                    name={f}
                    checked={currentFolder === f}
                    onChange={handleFolderChange}
                  />{" "}
                  {f}
                </label>
              ))}
            </div>
          </Dialog.Description>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between">
              <div>
                {addingNew || (
                  <DialogButton
                    fn={() => setAddingNew(true)}
                    icon="New"
                    disabled={false}
                  />
                )}
              </div>
              <div className="flex gap-4">
                <DialogButton fn={save} icon="Save" disabled={false} />
              </div>
            </div>
            {addingNew && (
              <div className="">
                <input
                  autoFocus
                  className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 "
                  type="text"
                  placeholder="New folder..."
                  onBlur={addNew}
                  onChange={handleNewFolderChange}
                />
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
