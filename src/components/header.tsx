import Link from "next/link";
import SearchBox from "./searchbox";

export default function Header() {
  return (
    <>
      <Link href="/">
        <h1 className="m-auto w-fit">Penultimate Guitar</h1>
      </Link>
      <SearchBox />
    </>
  );
}
