import { TabLinks } from "@/models";
import Link from "next/link";
import { useEffect, useState } from "react";
import TabLink from "./tablink";

export default function RecentTabs() {
  const [recents, setRecents] = useState<TabLinks>({});

  useEffect(() => {
    setRecents(JSON.parse(localStorage?.getItem("recents") || "[]"));
  }, []);

  return (
    <div>
      {Object.keys(recents).map((taburl: string, i) => (
        <TabLink taburl={taburl} key={i} {...recents[taburl]} />
      ))}
    </div>
  );
}
