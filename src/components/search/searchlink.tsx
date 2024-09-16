import Link from "next/link";
import PlainButton from "../shared/plainbutton";

function normalizedName(str: string) {
  str = str.toLowerCase();
  if (str === "bass tabs") {
    return "bass";
  }
  return str;
}

export default function SearchLink({
  tab_url,
  song_name,
  artist_name,
  rating,
  type,
  internal,
  best,
}: {
  tab_url: string;
  song_name: string;
  artist_name: string;
  rating: number;
  type: string;
  internal: boolean;
  best?: boolean;
}) {
  // const color: Record<string, string> = ;
  return (
    <Link
      href={`/${best ? "best" : "tab"}/${tab_url}`}
      className="w-full text-black dark:text-gray-200 no-underline hover:no-underline active:text-black dark:active:text-white"
      prefetch={false}
    >
      <PlainButton>
        <div className={"flex justify-between"}>
          <div className={"flex flex-col " + (internal ? "" : "italic")}>
            <div className="font-bold">{song_name}</div>
            <div className="">{artist_name}</div>
          </div>

          <div className="flex flex-col gap-1 items-end justify-between">
            <div
              className={
                `w-fit rounded-lg px-2 py-1 opacity-70 text-white uppercase text-xs ` +
                {
                  ukulele: "bg-purple-700",
                  chords: "bg-blue-700",
                  tabs: "bg-green-700",
                  bass: "bg-red-700",
                  drums: "bg-yellow-700",
                }[normalizedName(type)]
              }
            >
              {normalizedName(type)}
            </div>
            <div className="text-gray-400 min-w-20 text-right">
              {!Math.round(rating) || `${Math.round(rating * 100) / 100} / 5`}
            </div>
          </div>
        </div>
        <div className="flex justify-between"></div>
      </PlainButton>
    </Link>
  );
}
