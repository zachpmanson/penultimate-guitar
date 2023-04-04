import Link from "next/link";
import SearchBox from "./search/searchbox";

export default function Header() {
  return (
    <>
      <div className="flex justify-between m-auto max-w-2xl">
        <Link href="/">
          <h1 className="m-auto w-fit font-bold">Penultimate Guitar</h1>
        </Link>
        <div className="flex gap-6">
          <Link href="/directory">
            <span className="m-auto w-fit">Song Directory</span>
          </Link>
          <Link href="https://notes.zachmanson.com/penultimate-guitar">
            <span className="m-auto w-fit">About</span>
          </Link>
        </div>
      </div>
      <SearchBox />
    </>
  );
}
