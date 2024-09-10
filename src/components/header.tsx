import { useSession } from "next-auth/react";
import Link from "next/link";
import SearchBox from "./search/searchbox";
import ThemeSwitcher from "./buttons/themeSwitcher";
import PlainButton from "./shared/plainbutton";
import useSavedTabs from "@/hooks/useSavedTabs";
import { useRouter } from "next/router";
import IconShuffle from "./icons/IconShuffle";

export default function Header() {
  const router = useRouter();
  const session = useSession();
  const { savedTabs } = useSavedTabs();
  const allSaved = savedTabs.flatMap((f) => f.tabs).map((t) => t.taburl);

  return (
    <div className="no-print">
      <div className="flex justify-between m-auto max-w-2xl flex-wrap gap-2 flex-1">
        <div className="flex justify-center items-center gap-2">
          <Link href="/">
            <h1 className="m-auto w-fit font-bold">Penultimate Guitar</h1>
          </Link>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex gap-2 items-center">
            <PlainButton
              onClick={(e) => {
                e.stopPropagation();
                router.push(
                  "/tab/" +
                    allSaved[Math.floor(Math.random() * allSaved.length)]
                );
              }}
              disabled={allSaved.length === 0}
              className="pl-2 pr-2 inline-block float-right"
              title={
                allSaved.length === 0
                  ? "Save some tabs to shuffle!"
                  : "Random saved tab"
              }
            >
              <IconShuffle className="w-4 h-4" />
            </PlainButton>
            <ThemeSwitcher />
          </div>

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
