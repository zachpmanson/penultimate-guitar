import LoadingSpinner from "@/components/loadingspinner";
import TabSheet from "@/components/tabsheet";
import ToolbarButton from "@/components/toolbarbutton";
import { useGlobal } from "@/contexts/Global/context";
import { TabDto, TabLinkProps } from "@/models";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import "react-tooltip/dist/react-tooltip.css";
import _ from "lodash";
const scrollMs = 50;

export default function Tab() {
  const router = useRouter();
  const { id } = router.query;
  const [plainTab, setPlainTab] = useState("initial");
  const [tabDetails, setTabDetails] = useState<TabDto>();
  const [fontSize, setFontSize] = useState(12);
  const [tranposition, setTranposition] = useState(0);
  const [scrollSpeed, setScrollSpeed] = useState(0);
  const scrollinterval = useRef<NodeJS.Timer>();
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
        const recents: any = JSON.parse(
          localStorage?.getItem("recents") || "{}"
        );
        if (Array.isArray(recents)) {
          recents.unshift({
            taburl: res.taburl,
            name: res.name,
            artist: res.artist,
          });
          const uniqRecents = _.uniqBy(recents, (r: TabLinkProps) => r.taburl);
          localStorage.setItem("recents", JSON.stringify(uniqRecents));
        } else {
          let arrayRecents = Object.keys(recents).map((r) => ({
            taburl: r,
            name: recents[r].name,
            artist: recents[r].artist,
          }));

          arrayRecents.unshift({
            taburl: res.taburl,
            name: res.name,
            artist: res.artist,
          });

          const uniqRecents = _.uniqBy(
            arrayRecents,
            (r: TabLinkProps) => r.taburl
          );

          localStorage.setItem("recents", JSON.stringify(uniqRecents));
        }
      });
  }, [id]);

  const changeScrolling = (type: string) => {
    clearInterval(scrollinterval.current);
    if (type === "up") {
      setScrollSpeed(scrollSpeed + 1);
    } else {
      if (scrollSpeed > 0) {
        setScrollSpeed(scrollSpeed - 1);
      }
    }
  };

  useEffect(() => {
    if (scrollSpeed > 0) {
      scrollinterval.current = setInterval(
        () =>
          window.scrollBy({
            top: scrollSpeed * 2,
            left: 0,
            behavior: "smooth",
          }),
        scrollMs
      );
    }
  }, [scrollSpeed]);

  const formattedTransposition = () => {
    return tranposition < 0 ? tranposition.toString() : `+${tranposition}`;
  };

  return (
    <div>
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
          <div className="max-w-lg mx-auto my-4">
            {!!tabDetails?.contributors?.length && (
              <details>
                <summary>
                  {tabDetails?.contributors?.length} Contributors
                </summary>
                <ul>
                  {tabDetails?.contributors?.map((c, index) => (
                    <li key={index}>
                      <Link href={`https://www.ultimate-guitar.com/u/${c}`}>
                        {c}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            )}

            {!!tabDetails?.capo && <div>Capo: Fret {tabDetails?.capo}</div>}
            {!!tabDetails?.tuning && (
              <div>
                Tuning:{" "}
                <span className="font-bold">{tabDetails?.tuning.name}</span>,{" "}
                {tabDetails?.tuning.value}
              </div>
            )}
          </div>
          <div className="bg-white/50 w-full sticky top-0 ">
            <div className="flex justify-between max-w-lg mx-auto my-4 gap-4 font-mono text-sm flex-wrap">
              <div className="flex-1 flex-col text-center">
                Pin
                <div className="m-auto w-fit">
                  <ToolbarButton
                    fn={() =>
                      isPinned(tabDetails)
                        ? removePinnedTab(tabDetails)
                        : addPinnedTab(tabDetails)
                    }
                    icon={isPinned(tabDetails) ? "❌" : "📌"}
                  />
                </div>
              </div>

              <div className="flex-1 flex-col text-center">
                Font size
                <div className="flex gap-1 m-auto w-fit">
                  <ToolbarButton
                    fn={() => setFontSize(fontSize - 2)}
                    icon="➖"
                  />
                  <ToolbarButton
                    fn={() => setFontSize(fontSize + 2)}
                    icon="➕"
                  />
                </div>
              </div>

              <div className="flex-1 flex-col text-center">
                <p>
                  Transpose
                  {tranposition === 0 || ` (${formattedTransposition()})`}
                </p>
                <div className="flex gap-1 m-auto w-fit">
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

              <div className="flex-1 flex-col text-center">
                Autoscroll
                <div className="flex gap-1 m-auto w-fit">
                  <ToolbarButton fn={() => changeScrolling("down")} icon="➖" />
                  <ToolbarButton fn={() => changeScrolling("up")} icon="➕" />
                </div>
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
    </div>
  );
}
