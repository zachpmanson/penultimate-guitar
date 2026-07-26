import Link from "next/link";
import { useEffect } from "react";
import { useConfigStore } from "src/state/config";
import Header from "./header";

export default function Layout({ children }: any) {
  const { debugMode } = useConfigStore();

  useEffect(() => {
    document.querySelector("body")?.classList.toggle("debug", debugMode);
  }, [debugMode]);

  return (
    <>
      <Header />
      <div className="flex flex-col gap-4 ">
        <main>{children}</main>
        <footer>
          <div className="flex gap-6 justify-center no-print items-center">
            <Link prefetch={false} href="/directory/new/1">
              <span className="m-auto w-fit">Song Directory</span>
            </Link>

            <Link href="https://notes.zachmanson.com/penultimate-guitar">
              <span className="m-auto w-fit">About</span>
            </Link>

            <DeployLink />
          </div>
        </footer>
      </div>
    </>
  );
}

function DeployLink() {
  const rev = process.env.NEXT_PUBLIC_BUILD_REV;
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME;

  if (!rev) return null;

  let label = rev;
  if (buildTime) {
    const date = new Date(parseInt(buildTime) * 1000);
    label = `${date.toISOString().slice(0, 10)} @ ${rev}`;
  }

  return (
    <a href={`https://github.com/zachpmanson/penultimate-guitar/commit/${rev}`} target="_blank" rel="noreferrer">
      <span className="m-auto w-fit">{label}</span>
    </a>
  );
}