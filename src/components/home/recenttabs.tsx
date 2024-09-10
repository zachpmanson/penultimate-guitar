import { TabLinkDto } from "@/models/models";
import { useEffect, useState } from "react";
import TabLink from "./tablink";
import TablinkList from "./tablinklist";

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
        <TablinkList
          tablinks={recents.slice(0, 10).filter((r) => r.name && r.artist)}
          title="Recent Tabs"
        />
      ) : (
        <p className="text-center">Saved and recent tabs will show up here!</p>
      )}
    </div>
  );
}
