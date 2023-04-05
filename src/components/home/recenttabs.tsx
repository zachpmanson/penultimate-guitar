import { TabLinkProps } from "@/models";
import { useEffect, useState } from "react";
import TabLink from "./tablink";

export default function RecentTabs() {
  const [recents, setRecents] = useState<TabLinkProps[]>([]);

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
            <h1 className="text-center text-2xl my-4">Recent Tabs</h1>
          </summary>
          {recents
            .slice(0, 10)
            .filter((r) => r.name && r.artist)
            .map((r: TabLinkProps, i) => (
              <TabLink key={i} {...r} saved={false} />
            ))}
        </details>
      ) : (
        <p className="text-center">Recent tabs will show up here!</p>
      )}
    </div>
  );
}
