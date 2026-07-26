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
          <div className="flex gap-8 justify-center no-print">
            <Link prefetch={false} href="/directory/new/1">
              <span className="m-auto w-fit">Song Directory</span>
            </Link>

            <Link href="https://notes.zachmanson.com/penultimate-guitar">
              <span className="m-auto w-fit">About</span>
            </Link>
          </div>
          <DeployInfo />
        </footer>
      </div>
    </>
  );
}

function DeployInfo() {
  const rev = process.env.NEXT_PUBLIC_BUILD_REV;
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME;

  if (!rev && !buildTime) return null;

  let label = "";
  if (buildTime) {
    const date = new Date(parseInt(buildTime) * 1000);
    label = date.toISOString().slice(0, 10);
  }
  if (rev) label += label ? ` @ ${rev}` : rev;

  return <p className="text-xs text-center text-gray-400 mt-2">{label}</p>;
}