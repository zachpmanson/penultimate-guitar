import { useGlobal } from "@/contexts/Global/context";
import { TabLinkDto } from "@/models/models";
import _ from "lodash";
import Link from "next/link";
import TabLink from "./tablink";

export default function FilteredSavedTabs() {
  const { savedTabs, searchText } = useGlobal();
  const lowerSearchText = searchText.toLowerCase();
  const filteredTabs = _.uniqBy(
    savedTabs.filter(
      (t) =>
        t.name?.toLowerCase().includes(lowerSearchText) ||
        t.artist?.toLowerCase().includes(lowerSearchText)
    ),
    (t: TabLinkDto) => t.taburl
  );

  return (
    <div className="flex flex-col gap-4">
      {Object.keys(filteredTabs).length === 0 ? (
        <>
          <p className="text-center text-gray-400 font-extralight">
            No tabs containing &quot;{searchText}&quot; in favourites.
          </p>
        </>
      ) : (
        <div>
          <details open>
            <summary>
              <h1 className="text-center text-2xl my-4">
                Favourites containing &quot;{searchText}&quot;
              </h1>
            </summary>
            <div className="flex flex-col gap-2 mt-2">
              {filteredTabs.map((tab, i) => (
                <TabLink key={i} tablink={{ ...tab, saved: true }} />
              ))}
            </div>
          </details>
        </div>
      )}
      <p className="text-center">
        Click{" "}
        <Link href={`/search?q=${encodeURIComponent(searchText)}`}>search</Link>{" "}
        to search all tabs.
      </p>
    </div>
  );
}
