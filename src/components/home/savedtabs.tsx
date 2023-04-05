import { useGlobal } from "@/contexts/Global/context";
import { TabLinkProps } from "@/models";
import TabLink from "./tablink";

export default function SavedTabs() {
  const { savedTabs } = useGlobal();
  console.log(savedTabs);
  const folders: { [key: string]: TabLinkProps[] } = { Favourites: [] };
  for (let tab of savedTabs) {
    const folderName = tab.folder ?? "Favourites";
    if (folders[folderName]) {
      folders[folderName].push(tab);
    } else {
      folders[folderName] = [tab];
    }
  }
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
                      <TabLink key={j} {...t} saved={true} />
                    ))}
                  </div>
                ) : (
                  <details key={i} className="bg-gray-200 rounded-xl p-4">
                    <summary>
                      <h2 className="text-xl">{folder}</h2>
                    </summary>
                    <div className="flex flex-col gap-2 mt-2">
                      {folders[folder].map((t, j) => (
                        <TabLink key={j} {...t} saved={true} />
                      ))}
                    </div>
                  </details>
                )
              )}
            </div>

            {/* {savedTabs.map((savedTab: TabLinkProps, i) => (
              <TabLink key={i} {...savedTab} saved={true} />
            ))} */}
          </details>
        </div>
      )}
    </div>
  );
}
