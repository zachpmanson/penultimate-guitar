import useSavedTabs from "@/hooks/useSavedTabs";
import { TabLinkDto } from "@/models/models";
import {
  ChangeEvent,
  Dispatch,
  KeyboardEvent,
  KeyboardEventHandler,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import DialogButton from "./dialogbutton";
import { dedupe } from "@/utils/dedupe";
import BaseDialog from "./basedialog";

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
      ...Array.from(new Set(["Favourites", ...savedTabs.map((f) => f.name)])),
    ];
    setFolders(folderNames);

    let currentFolderNames = savedTabs
      .filter((f) => f.tabs?.map((t) => t.taburl).includes(tab.taburl))
      .map((f) => f.name);

    let actualFolderNames: string[] = [];
    for (let name of currentFolderNames) {
      if (!!name) {
        actualFolderNames.push(name);
      }
    }

    setCurrentFolders(actualFolderNames);
  }, [savedTabs, tab.taburl]);

  useEffect(() => {
    console.log({ currentFolders });
  }, [currentFolders]);

  const save = () => {
    console.log("save", { tab, currentFolders });
    setTabFolders(tab, currentFolders);
    setIsOpen(false);
  };

  const handleFolderChange = (event: ChangeEvent<HTMLInputElement>) => {
    console.log("handleFolderChange", event.target.value);
    if (currentFolders.includes(event.target.value)) {
      setCurrentFolders((old) => old.filter((f) => f !== event.target.value));
    } else if (event.target.value) {
      setCurrentFolders((old) => [...old, event.target.value]);
    }
  };

  const handleNewFolderChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewFolder(event.target.value);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") addNew();
  };

  const addNew = () => {
    let trimmedName = newFolder.trim();
    if (!!trimmedName && trimmedName.length < 20) {
      setFolders(dedupe<string>([...folders, trimmedName]));
      setCurrentFolders(dedupe<string>([...currentFolders, trimmedName]));
    }
    setAddingNew(false);
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Save tab to folder"
    >
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
                <DialogButton onClick={() => save()} disabled={false}>
                  Save
                </DialogButton>
              </div>
            </>
          )}
        </div>
      </div>
    </BaseDialog>
  );
}
