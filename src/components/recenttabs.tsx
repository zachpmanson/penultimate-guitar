import { TabLinks } from "@/models";
import Link from "next/link";

export default function RecentTabs() {
  if (typeof window === "undefined") {
    return <div></div>;
  }

  const recents: TabLinks = JSON.parse(
    localStorage?.getItem("recents") || "[]"
  );

  return (
    <div>
      {Object.keys(recents).map((taburl: string, i) => (
        <Link key={i} href={`/tab/${taburl}`}>
          <div className="border-grey-500 border-2 p-4 my-4 rounded-xl max-w-xl mx-auto hover:drop-shadow">
            {recents[taburl].name} - {recents[taburl].artist}
          </div>
        </Link>
      ))}
    </div>
  );
}
