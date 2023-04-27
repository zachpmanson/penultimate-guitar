import { SearchResult } from "@/models";
import Link from "next/link";
import PlainButton from "../plainbutton";

type SearchLinkProps = SearchResult;

export default function SearchLink({
  tab_url,
  song_name,
  artist_name,
  rating,
  type,
}: SearchLinkProps) {
  return (
    <Link
      href={`/tab/${tab_url}`}
      className="w-full text-black no-underline hover:no-underline active:text-black"
    >
      <PlainButton>
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
      </PlainButton>
    </Link>
  );
}
