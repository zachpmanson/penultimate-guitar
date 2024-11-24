import { TabLinkDto } from "@/models/models";
import { useEffect, useState } from "react";
import TablinkList from "./tablinklist";

export default function RecentTabs() {
  const [recents, setRecents] = useState<TabLinkDto[]>([]);

  useEffect(() => {
    const savedRecents: any = JSON.parse(
      localStorage?.getItem("recents") || "[]",
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
    <TablinkList
      tablinks={recents.slice(0, 10).filter((r) => r.name && r.artist)}
      title="Recent Tabs"
      emptyMessage={
        <p className="text-center">Recently viewed tabs will show up here!</p>
      }
    />
  );
}
