import { SearchResult } from "@/models";
import Link from "next/link";

type SearchLinkProps = SearchResult;

export default function SearchLink({
  tab_url,
  song_name,
  artist_name,
  version,
  rating,
  type,
}: SearchLinkProps) {
  return (
    <div>
      <Link href={`/tab/${tab_url}`}>
        <div className="border-grey-500 border-2 p-4 my-4 rounded-xl max-w-xl mx-auto hover:shadow-md transition ease-in-out flex-col text-black">
          <div className="flex justify-between">
            <div>
              {song_name} - {artist_name}
            </div>
            <div>
              <p>{type}</p>
            </div>
          </div>
          <div className="flex justify-between">
            <div>
              <p>Version: {version}</p>
            </div>
            <div>
              <p>
                {!Math.round(rating) ||
                  "Rating: " + "⭐".repeat(Math.round(rating))}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
