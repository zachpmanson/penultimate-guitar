import { SearchResult } from "@/models";
import Link from "next/link";

type SearchLinkProps = SearchResult;

export default function SearchLink({
  tab_url,
  song_name,
  artist_name,
  version,
  rating,
}: SearchLinkProps) {
  return (
    <div>
      <Link href={`/tab/${tab_url}`}>
        <div className="border-grey-500 border-2 p-4 my-4 rounded-xl max-w-xl mx-auto hover:shadow-md transition ease-in-out flex-col">
          {song_name} - {artist_name}
          <p>Version: {version}</p>
          <p>Rating: {rating}/5</p>
        </div>
      </Link>
    </div>
  );
}
