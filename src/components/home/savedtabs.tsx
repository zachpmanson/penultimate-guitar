import { useGlobal } from "@/contexts/Global/context";
import { TabLinkDto } from "@/models";
import TabLink from "./tablink";

export default function SavedTabs() {
  const { savedTabs, removeSavedTab } = useGlobal();
  console.log(savedTabs);
  const folders: { [key: string]: TabLinkDto[] } = { Favourites: [] };
  for (let tab of savedTabs) {
    const folderName = tab.folder ?? "Favourites";
    if (folders[folderName]) {
      folders[folderName].push(tab);
    } else {
      folders[folderName] = [tab];
    }
  }

  const deleteFolder = (folder: TabLinkDto[]) => {
    for (let tablink of folder) {
      removeSavedTab(tablink);
    }
  };

  return (
    <div>
      {Object.keys(savedTabs).length === 0 || (
        <div>
          <details open>
            <summary>
              <h1 className="text-center text-2xl my-4">Favourites</h1>
            </summary>
            <div className="flex flex-col gap-2 mt-2">
              {Object.keys(folders).map((folder, i) =>
                folder === "Favourites" ? (
                  <div key={i} className="flex flex-col gap-2">
                    {folders[folder].map((t, j) => (
                      <TabLink key={j} tablink={{ ...t, saved: true }} />
                    ))}
                  </div>
                ) : (
                  <details
                    key={i}
                    className="bg-gray-200 rounded-xl  border-2 hover:border-gray-400  transition ease-in-out"
                  >
                    <summary className="p-4">
                      <h2 className="text-xl">{folder}</h2>
                    </summary>
                    <div className="flex flex-col gap-2 m-4 mt-0">
                      {folders[folder].map((t, j) => (
                        <TabLink key={j} tablink={{ ...t, saved: true }} />
                      ))}
                    </div>
                  </details>
                )
              )}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
