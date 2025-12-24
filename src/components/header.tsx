import useSavedTabs from "@/hooks/useSavedTabs";
import useThemeOnMount from "@/hooks/useThemeOnMount";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import ThemeSwitcher from "./buttons/themeswitcher";
import IconShuffle from "./icons/IconShuffle";
import SearchBox from "./search/searchbox";
import PlainButton from "./shared/plainbutton";
import { ROUTE_PREFIX } from "@/constants";

export default function Header() {
  const { theme } = useThemeOnMount();

  const router = useRouter();
  const session = useSession();
  const { flatTabs } = useSavedTabs();
  const allSaved = flatTabs.map((t) => t.taburl);

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
              href={ROUTE_PREFIX.TAB + "/" + allSaved[Math.floor(Math.random() * allSaved.length)]}
              disabled={allSaved.length === 0}
              className="flex items-center justify-center w-8 h-8"
              noPadding
              title={allSaved.length === 0 ? "Save some tabs to shuffle!" : "Random saved tab"}
            >
              <IconShuffle className="w-4 h-4" color={theme === "dark" ? "white" : "black"} />
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
