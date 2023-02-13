import LoadingSpinner from "@/components/loadingspinner";
import TabSheet from "@/components/tabsheet";
import { useGlobal } from "@/contexts/Global/context";
import { TabDto, TabLinks } from "@/models";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Tab() {
  const router = useRouter();
  const { id } = router.query;
  const [plainTab, setPlainTab] = useState("initial");
  const [tabDetails, setTabDetails] = useState<TabDto>();
  const [fontSize, setFontSize] = useState(12);

  const { addPinnedTab, removePinnedTab, isPinned } = useGlobal();

  useEffect(() => {
    if (typeof id !== "object") return;
    const link: string = id.join("/");

    fetch("/api/tab", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: link }),
    })
      .then((res) => res.json())
      .then((res: TabDto) => {
        setTabDetails(res);
        setPlainTab(res.tab ?? "");
        const recents: TabLinks = JSON.parse(
          localStorage?.getItem("recents") || "{}"
        );
        recents[link] = { name: res.name, artist: res.artist };
        localStorage.setItem("recents", JSON.stringify(recents));
      });
  }, [id]);

  return (
    <>
      <Head>
        <title>
          {tabDetails?.name
            ? `${tabDetails?.name} - ${tabDetails?.artist}`
            : "Penultimate Guitar"}
        </title>
      </Head>

      {!!tabDetails?.name ? (
        <>
          <h1 className="text-center text-2xl my-4">
            {tabDetails?.name} - {tabDetails?.artist}
          </h1>
          <div className="flex justify-between w-fit mx-auto my-4 gap-4">
            <button
              onClick={() =>
                isPinned(tabDetails)
                  ? removePinnedTab(tabDetails)
                  : addPinnedTab(tabDetails)
              }
              className="flex items-center justify-center w-10 h-10 text-md text-lg border-grey-500 border-2 rounded-xl hover:shadow-md transition ease-in-out "
            >
              {isPinned(tabDetails) ? "❌" : "📌"}
            </button>
            <div className="flex">
              <button
                onClick={() => setFontSize(fontSize - 4)}
                className="flex items-center justify-center w-10 h-10 text-md text-lg border-grey-500 border-2 rounded-xl hover:shadow-md transition ease-in-out "
              >
                ➖
              </button>

              <button
                onClick={() => setFontSize(fontSize + 4)}
                className="flex items-center justify-center w-10 h-10 text-md text-lg border-grey-500 border-2 rounded-xl hover:shadow-md transition ease-in-out "
              >
                ➕
              </button>
            </div>
          </div>
          <TabSheet plainTab={plainTab} fontSize={fontSize}></TabSheet>
        </>
      ) : (
        <LoadingSpinner />
      )}
    </>
  );
}
