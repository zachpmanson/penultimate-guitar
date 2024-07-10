import { TabLinkDto } from "@/models/models";
import { useEffect, useState } from "react";
import TabLink from "./tablink";

export default function RecentTabs() {
  const [recents, setRecents] = useState<TabLinkDto[]>([]);

  useEffect(() => {
    const savedRecents: any = JSON.parse(
      localStorage?.getItem("recents") || "[]"
    );
    if (Array.isArray(savedRecents)) {
      setRecents(savedRecents);
    } else {
      // convert to new format
      const arrayRecents = Object.keys(savedRecents).map((r) => ({
        taburl: r,
        name: savedRecents[r].name,
        artist: savedRecents[r].artist,
        version: savedRecents[r].version,
      }));

      setRecents(arrayRecents);
      localStorage.setItem("recents", JSON.stringify(arrayRecents));
    }
  }, []);

  return (
    <div>
      {Object.keys(recents).length > 0 ? (
        <details open>
          <summary>
            <h1 className="text-center text-xl my-4">Recent Tabs</h1>
          </summary>
          <div className="flex flex-col gap-1 mt-2">
            {recents
              .slice(0, 10)
              .filter((r) => r.name && r.artist)
              .map((r: TabLinkDto, i) => (
                <TabLink
                  key={i}
                  tablink={{ ...r, saved: true }}
                  recent={true}
                />
              ))}
          </div>
        </details>
      ) : (
        <p className="text-center">Saved and recent tabs will show up here!</p>
      )}
    </div>
  );
}
