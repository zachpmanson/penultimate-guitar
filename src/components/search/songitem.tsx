import { SitemapSearchResult } from "@/server/services/search-query";
import PlainButton from "../shared/plainbutton";
import Link from "next/link";
import { ReactNode } from "react";
function normalizedName(str: string) {
  str = str.toLowerCase();
  if (str === "bass tabs") {
    return "bass";
  }
  return str;
}

function ActiveButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="text-black dark:text-gray-200 no-underline hover:no-underline active:text-black dark:active:text-white"
    >
      <PlainButton className={"flex gap-2 items-center justify-center"}>
        <div className="w-full uppercase text-xs text-center">{children}</div>
      </PlainButton>
    </Link>
  );
}

function DisabledButton({ children }: { children: ReactNode }) {
  return (
    <PlainButton
      className={"flex gap-2 items-center justify-center opacity-20"}
      title="No chords available"
      disabled
    >
      <div className="w-full uppercase text-xs text-center">{children}</div>
    </PlainButton>
  );
}
export default function SongItem({ song }: { song: SitemapSearchResult }) {
  const tabs = song.tabs.find((t) => t.type === "tabs");
  const chords = song.tabs.find((t) => t.type === "chords");
  const ukulele = song.tabs.find((t) => t.type === "ukulele");
  const bass = song.tabs.find((t) => normalizedName(t.type) === "bass");

  return (
    <div className="flex gap-2 flex-col">
      <div className="flex gap-x-4 flex-wrap">
        <div className="font-bold">{song.name}</div>
        <div className="">{song.artist}</div>
      </div>
      <div className="flex gap-1">
        <div className="w-1/4">
          {chords ? (
            <ActiveButton href={`/best/${chords.taburl}`}>Chords</ActiveButton>
          ) : (
            <DisabledButton>Chords</DisabledButton>
          )}
        </div>

        <div className="w-1/4">
          {tabs ? (
            <ActiveButton href={`/best/${tabs.taburl}`}>Tabs</ActiveButton>
          ) : (
            <DisabledButton>Tabs</DisabledButton>
          )}
        </div>

        <div className="w-1/4">
          {bass ? (
            <ActiveButton href={`/best/${bass.taburl}`}>Bass</ActiveButton>
          ) : (
            <DisabledButton>Bass</DisabledButton>
          )}
        </div>

        <div className="w-1/4">
          {ukulele ? (
            <ActiveButton href={`/best/${ukulele.taburl}`}>
              Ukulele
            </ActiveButton>
          ) : (
            <DisabledButton>Ukulele</DisabledButton>
          )}
        </div>
      </div>
    </div>
  );
}
