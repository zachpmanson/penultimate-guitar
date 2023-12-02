import { useGlobal } from "@/contexts/Global/context";
import Header from "./header";
import LoadingSpinner from "./loadingspinner";
import Link from "next/link";

export default function Layout({ children }: any) {
  const { globalLoading } = useGlobal();

  return (
    <>
      <Header />
      {globalLoading !== "" && (
        <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-black opacity-75 flex flex-col items-center justify-center">
          <LoadingSpinner />
          <h2 className="text-center text-white text-xl font-semibold text-opacity-100">
            Loading...
          </h2>
          <p className="w-1/3 text-center text-white text-opacity-100">
            {globalLoading}
          </p>
        </div>
      )}
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
