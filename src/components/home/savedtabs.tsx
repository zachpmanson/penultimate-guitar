import useSavedTabs from "@/hooks/useSavedTabs";
import { BookmarkIcon } from "@heroicons/react/24/outline";
import TabLink from "./tablink";
import { Load } from "../loadingspinner";
import FolderPanel from "./folderpanel";
import { sortByName } from "@/utils/sort";

export default function SavedTabs() {
  const { savedTabs, flatTabs, isLoadingTabs } = useSavedTabs();
  const allSaved = flatTabs.map((t) => t.taburl);

  const favourites = savedTabs.find((f) => f.name === "Favourites");
  return (
    <div>
      <div>
        <div className="pt-4">
          <h1 className="text-left text-xl">Favourites</h1>
        </div>
        <Load isLoading={isLoadingTabs}>
          {allSaved.length === 0 ? (
            <div className="flex flex-col gap-1 mt-2">
              <p className="text-center">
                You have no saved tabs yet! Press <BookmarkIcon className="h-[1em] inline-block" /> to save a tab.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1 mt-2">
              <>
                {favourites && (
                  <div className="flex flex-col gap-1">
                    {favourites.tabs
                      .sort((a, b) => sortByName(a.name ?? "", b.name ?? ""))
                      .map((t, j) => (
                        <TabLink key={j} tablink={{ ...t, saved: true }} folder={favourites.name} />
                      ))}
                  </div>
                )}
                {savedTabs
                  .sort((a, b) => sortByName(a.name, b.name))
                  .filter((f) => f.name !== "Favourites")
                  .map((folder, i) => (
                    <FolderPanel folder={folder} key={`${i}-${folder.name}`} />
                  ))}
              </>
            </div>
          )}
        </Load>
      </div>
    </div>
  );
}
