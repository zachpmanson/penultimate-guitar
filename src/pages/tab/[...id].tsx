import LoadingSpinner from "@/components/loadingspinner";
import TabSheet from "@/components/tabsheet";
import ToolbarButton from "@/components/toolbarbutton";
import { useGlobal } from "@/contexts/Global/context";
import { TabDto, TabLinks } from "@/models";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import "react-tooltip/dist/react-tooltip.css";

export default function Tab() {
  const router = useRouter();
  const { id } = router.query;
  const [plainTab, setPlainTab] = useState("initial");
  const [tabDetails, setTabDetails] = useState<TabDto>();
  const [fontSize, setFontSize] = useState(12);
  const [tranposition, setTranposition] = useState(0);

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

  const formattedTransposition = () => {
    return tranposition < 0 ? tranposition.toString() : `+${tranposition}`;
  };

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
          <div className="flex justify-between w-fit mx-auto my-4 gap-8 font-mono text-sm">
            <div className="flex flex-col text-center">
              Pin
              <ToolbarButton
                fn={() =>
                  isPinned(tabDetails)
                    ? removePinnedTab(tabDetails)
                    : addPinnedTab(tabDetails)
                }
                icon={isPinned(tabDetails) ? "❌" : "📌"}
              />
            </div>

            <div className="flex flex-col text-center">
              Font size
              <div className="flex gap-1">
                <ToolbarButton fn={() => setFontSize(fontSize - 2)} icon="➖" />
                <ToolbarButton fn={() => setFontSize(fontSize + 2)} icon="➕" />
              </div>
            </div>

            <div className="flex flex-col text-center">
              <p>
                Transpose
                {tranposition === 0 || ` (${formattedTransposition()})`}
              </p>
              <div className="flex gap-1 m-auto">
                <ToolbarButton
                  fn={() => setTranposition(tranposition - 1)}
                  icon="➖"
                />
                <ToolbarButton
                  fn={() => setTranposition(tranposition + 1)}
                  icon="➕"
                />
              </div>
            </div>
          </div>
          <TabSheet
            plainTab={plainTab}
            fontSize={fontSize}
            transposition={tranposition}
          ></TabSheet>
        </>
      ) : (
        <LoadingSpinner />
      )}
    </>
  );
}
