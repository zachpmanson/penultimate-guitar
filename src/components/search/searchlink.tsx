import Link from "next/link";
import PlainButton from "../shared/plainbutton";

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
  return (
    <Link
      href={`/${best ? "best" : "tab"}/${tab_url}`}
      className="w-full text-black dark:text-gray-200 no-underline hover:no-underline active:text-black dark:active:text-white"
      prefetch={false}
    >
      <PlainButton>
        <div className={"flex justify-between " + (internal ? "" : "italic")}>
          <div className="flex flex-col">
            <div className="font-bold">{song_name}</div>
            <div className="">{artist_name}</div>
          </div>

          <div className="flex flex-col gap-1 text-right">
            <div>{type}</div>
            <div className="text-gray-400">
              {!Math.round(rating) ||
                `${Math.round(rating * 100) / 100} / 5.00`}
            </div>
          </div>
        </div>
        <div className="flex justify-between"></div>
      </PlainButton>
    </Link>
  );
}
