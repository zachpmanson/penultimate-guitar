import SearchBox from "@/components/searchbox";
import { TabLinks } from "@/models";
import Head from "next/head";
import Link from "next/link";

export default function RecentTabs() {
  if (typeof window === "undefined") {
    return <div></div>;
  }

  const recents: TabLinks = JSON.parse(
    localStorage?.getItem("recents") || "[]"
  );

  return (
    <>
      {Object.keys(recents).map((taburl: string, i) => (
        <div
          key={i}
          className="border-grey-500 border-2 p-4 my-4 rounded-xl max-w-xl mx-auto"
        >
          <Link href={`/tab/${taburl}`}>
            {recents[taburl].name} - {recents[taburl].artist}
          </Link>
        </div>
      ))}
    </>
  );
}
