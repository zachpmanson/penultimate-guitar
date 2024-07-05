import Link from "next/link";
import PlainButton from "../shared/plainbutton";

export default function SearchLink({
  tab_url,
  song_name,
  artist_name,
  rating,
  type,
}: {
  tab_url: string;
  song_name: string;
  artist_name: string;
  rating: number;
  type: string;
}) {
  return (
    <Link
      href={`/tab/${tab_url}`}
      className="w-full text-black no-underline hover:no-underline active:text-black"
      prefetch={false}
    >
      <PlainButton>
        <div className="flex justify-between">
          <div>
            <span className="font-bold">{song_name}</span> - {artist_name}
          </div>
          <div className="flex gap-1">
            <div className="text-gray-400">
              {!Math.round(rating) ||
                `${Math.round(rating * 100) / 100} / 5.00`}
            </div>
            <div>{type}</div>
          </div>
        </div>
        <div className="flex justify-between"></div>
      </PlainButton>
    </Link>
  );
}
