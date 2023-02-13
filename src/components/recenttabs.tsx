import { TabLinks } from "@/models";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function RecentTabs() {
  const [recents, setRecents] = useState<TabLinks>({});

  useEffect(() => {
    setRecents(JSON.parse(localStorage?.getItem("recents") || "[]"));
  }, []);

  return (
    <div>
      {Object.keys(recents).map((taburl: string, i) => (
        <Link key={i} href={`/tab/${taburl}`}>
          <div className="border-grey-500 border-2 p-4 my-4 rounded-xl max-w-xl mx-auto hover:shadow">
            {recents[taburl].name} - {recents[taburl].artist}
          </div>
        </Link>
      ))}
    </div>
  );
}
