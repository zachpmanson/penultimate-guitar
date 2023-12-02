import Link from "next/link";
import SearchBox from "./search/searchbox";
import { useSession } from "next-auth/react";

export default function Header() {
  const session = useSession();
  return (
    <div className="no-print">
      <div className="flex justify-between m-auto max-w-2xl flex-wrap gap-2">
        {/* <div className="flex justify-between gap-2 flex-1 min-w-fit"> */}
        <Link href="/">
          <h1 className="m-auto w-fit font-bold">Penultimate Guitar</h1>
        </Link>
        {/* </div> */}
        <div className="flex gap-6">
          {session.status === "authenticated" ? (
            <Link prefetch={false} href="/profile">
              <span className="m-auto w-fit">{session.data.user?.name}</span>
            </Link>
          ) : (
            <Link prefetch={false} href="/login">
              <span className="m-auto w-fit">Login</span>
            </Link>
          )}
        </div>
      </div>
      <SearchBox />
    </div>
  );
}
