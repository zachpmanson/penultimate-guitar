import { SearchResult } from "@/models";
import Link from "next/link";

type SearchLinkProps = SearchResult;

export default function SearchLink({
  tab_url,
  song_name,
  artist_name,
  rating,
  type,
}: SearchLinkProps) {
  return (
    <div className="w-full flex mx-auto justify-between gap-2">
      <Link href={`/tab/${tab_url}`} className="w-full text-black no-underline">
        <div className="border-grey-500 border-2 p-4 rounded-xl hover:shadow-md transition ease-in-out flex-col text-black">
          <div className="flex justify-between">
            <div>
              <span className="font-bold">{song_name}</span> - {artist_name}
            </div>
            <div></div>
          </div>
          <div className="flex justify-between">
            <div>
              <p>
                {!Math.round(rating) ||
                  `Rating: ${Math.round(rating * 100) / 100} / 5.00`}
              </p>
            </div>
            <div>
              <p>{type}</p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
