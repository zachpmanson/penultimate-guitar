import Link from "next/link";
import Header from "./header";

export default function Layout({ children }: any) {
  return (
    <>
      <Header />
      <div className="flex flex-col gap-4">
        <main>{children}</main>
        <footer>
          <div className="flex gap-8 justify-center">
            <Link prefetch={false} href="/directory/artist/1">
              <span className="m-auto w-fit">Song Directory</span>
            </Link>

            <Link href="https://notes.zachmanson.com/penultimate-guitar">
              <span className="m-auto w-fit">About</span>
            </Link>
          </div>
        </footer>
      </div>
    </>
  );
}
