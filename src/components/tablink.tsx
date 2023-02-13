import { TabDto } from "@/models";
import Link from "next/link";

type TabLinkProps = TabDto;

export default function TabLink({ taburl, name, artist }: TabLinkProps) {
  return (
    <div>
      <Link href={`/tab/${taburl}`}>
        <div className="border-grey-500 border-2 p-4 my-4 rounded-xl max-w-xl mx-auto hover:shadow-md transition ease-in-out">
          {name} - {artist}
        </div>
      </Link>
    </div>
  );
}
