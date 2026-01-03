import SaveDialog from "@/components/dialog/savedialog";
import TabSheet from "@/components/tab/tabsheet";
import ToolbarButton, { getToolbarButtonStyle } from "@/components/tab/toolbarbutton";
import { GuitaleleStyle, ROUTES } from "@/constants";
import useAutoscroll from "@/hooks/useAutoscroll";
import { TabDto, TabLinkDto } from "@/models/models";
import { useConfigStore } from "@/state/config";
import { mapTabDtoToTabLink } from "@/utils/conversion";
import { tabCompareFn } from "@/utils/sort";
import { BookmarkIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import _ from "lodash";
import Head from "next/head";
import Link from "next/link";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useWakeLock } from "react-screen-wake-lock";
import "react-tooltip/dist/react-tooltip.css";
import BaseMenu from "../shared/basemenu";

export default function TabBase({ tabDetails }: { tabDetails: TabDto }) {
  const {
    request: requestWakeLock,
    release: releaseWakeLock,
    isSupported,
    released,
  } = useWakeLock({
    onRequest: () => console.debug("Screen Wake Lock: requested!"),
    onError: (e) => console.debug("An error happened", e),
    onRelease: () => console.debug("Screen Wake Lock: released!"),
  });

  const element = useRef<HTMLDivElement>(null);
  const { scrollSpeed, changeScrolling, setScrollSpeed, isTouching } = useAutoscroll(element);

  const { mode, setMode } = useConfigStore();
  const [fontSize, setFontSize] = useState(12);
  const [tranposition, setTranposition] = useState(mode === "guitalele" ? -5 : 0);
  const oldScrollSpeed = useRef(1);
  const [saveDialogActive, setSaveDialogActive] = useState(false);

  const plainTab = tabDetails?.tab ?? "";
  const tabLink = mapTabDtoToTabLink(tabDetails);

  useEffect(() => {
    const recents: any = JSON.parse(localStorage?.getItem("recents") || "{}");
    if (Array.isArray(recents)) {
      recents.unshift({
        taburl: tabDetails.taburl,
        name: tabDetails.song.name,
        artist: tabDetails.song.artist,
        version: tabDetails.version,
        type: tabDetails.type,
      });
      const uniqRecents = _.uniqBy(recents, (r: TabLinkDto) => r.taburl);
      localStorage.setItem("recents", JSON.stringify(uniqRecents));
    } else {
      let arrayRecents = Object.keys(recents).map((r) => ({
        taburl: r,
        name: recents[r].name,
        artist: recents[r].artist,
        version: recents[r].version,
        type: recents[r].type,
      }));

      arrayRecents.unshift({
        taburl: tabDetails.taburl,
        name: tabDetails.song.name,
        artist: tabDetails.song.artist,
        version: tabDetails.version,
        type: tabDetails.type,
      });

      const uniqRecents = _.uniqBy(arrayRecents, (r: TabLinkDto) => r.taburl);

      localStorage.setItem("recents", JSON.stringify(uniqRecents));
    }
  }, [tabDetails]);

  useEffect(() => {
    if (tranposition !== -5) setMode("default");
  }, [tranposition, setMode]);

  useEffect(() => {
    if (mode === "guitalele") setTranposition(-5);
  }, [mode, setTranposition]);

  useEffect(() => {
    console.debug({ isSupported, released });
    requestWakeLock();
    return () => {
      console.debug({ isSupported, released });
      releaseWakeLock();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onTouch = () => (isTouching.current = true);
    const onTouchEnd = () => setTimeout(() => (isTouching.current = false), 2000);

    window.addEventListener("touchstart", onTouch);
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("keydown", onTouchEnd);

    const keyDownHandler = (event: KeyboardEvent) => {
      if (
        event.key === " " &&
        (document.activeElement === element.current || document.activeElement?.tagName === "BODY")
      ) {
        event.preventDefault();
        setScrollSpeed((old) => {
          if (old === 0) {
            return oldScrollSpeed.current;
          } else {
            oldScrollSpeed.current = old;
            return 0;
          }
        });
      }
    };

    window.addEventListener("keydown", keyDownHandler);

    return () => {
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", keyDownHandler);
    };
  }, [setScrollSpeed, isTouching]);

  const handleSave = () => {
    setSaveDialogActive(true);
  };

  const formattedTransposition = () => {
    return tranposition === 0 ? "" : tranposition < 0 ? tranposition.toString() : `+${tranposition}`;
  };

  const toggleMode = () => {
    if (mode === "guitalele") {
      setTranposition(0);
      setMode("default");
    } else {
      setMode("guitalele");
    }
  };

  let overflowMenu = (
    <>
      <BaseMenu
        buttonClassName={getToolbarButtonStyle(false)}
        items={[
          <button
            onClick={() => toggleMode()}
            className={
              "hover:bg-blue-700 hover:text-white text-gray-900 dark:text-gray-200 group flex w-full items-center rounded-md px-2 py-2 text-sm"
            }
          >
            {mode === "default" ? (
              <span>
                Enable <span className={GuitaleleStyle}>Guitalele Mode</span>
              </span>
            ) : (
              <span>
                Disable <span className={GuitaleleStyle}>Guitalele Mode</span>
              </span>
            )}
          </button>,
          <button
            onClick={() => print()}
            className={
              "hover:bg-blue-700 hover:text-white text-gray-900  dark:text-gray-200 group flex w-full items-center rounded-md px-2 py-2 text-sm"
            }
          >
            Print
          </button>,
          <Link
            href={`https://tabs.ultimate-guitar.com/tab/${tabDetails.taburl}`}
            className="hover:bg-blue-700 hover:text-white text-gray-900  dark:text-gray-200 group flex w-full items-center rounded-md px-2 py-2 text-sm no-underline "
          >
            View on Ultimate Guitar
          </Link>,
        ]}
      />
    </>
  );

  return (
    <>
      <Head>
        <title>
          {tabDetails.song.name
            ? `${tabDetails.song.name} ${tabDetails.song.artist && "- " + tabDetails.song.artist}`
            : "Penultimate Guitar"}
        </title>
      </Head>
      <div ref={element} tabIndex={0} className="flex flex-col align-middle w-full">
        <div>
          <h1 className="text-center text-2xl my-4">
            <span className="font-medium">{tabDetails.song.name}</span>
            <span className="font-light">{` ${tabDetails.song.artist && "- " + tabDetails.song.artist}`}</span>
          </h1>
          <div className="max-w-lg mx-auto my-4">
            {(tabDetails?.song?.Tab?.length ?? 1) > 1 && (
              <details className="no-print">
                <summary>
                  Version {tabDetails?.version} of {tabDetails.song.Tab?.length}
                </summary>

                <ul>
                  {tabDetails.song.Tab?.sort(tabCompareFn).map((t, index) => (
                    <li key={index}>
                      {t.taburl === tabDetails.taburl || (
                        <div className="flex justify-between">
                          <Link href={ROUTES.TAB(t.taburl)} prefetch={false}>
                            {tabDetails.song.name}
                            <span className="font-light text-xs">
                              {" "}
                              ({t.type}) (v{t.version}){" "}
                            </span>
                          </Link>
                          <div>Rating: {Math.round(t.rating * 100) / 100} / 5.00</div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </details>
            )}
            {!!tabDetails?.capo && <div>Capo: Fret {tabDetails?.capo}</div>}
            {!!tabDetails?.tuning?.value && (
              <div>
                Tuning: <span className="font-bold">{tabDetails?.tuning.name}</span>, {tabDetails?.tuning.value}
              </div>
            )}
          </div>
        </div>

        <hr className="my-4 no-print dark:border-gray-600" />

        <div className="relative max-w-full lg:w-fit lg:mx-auto lg:px-24 z-0">
          <>
            <div className="absolute top-0 w-full h-full lg:min-w-96 lg:right-0 lg:w-fit">
              <div className="bg-white/50 lg:bg-transparent dark:bg-default-dark/50 dark:lg:bg-transparent sticky top-0 top-toolbar dark:top-toolbar lg:top-toolbar dark:lg:top-toolbar no-print z-40 lg:ml-auto max-w-[min(100%, 32rem)] m-auto w-full overflow-hidden h-20 pointer-events-none"></div>
            </div>
            <div className="absolute top-0 w-full h-full lg:min-w-96 lg:right-0 lg:w-fit">
              <div
                className="sticky top-0 dark:top-toolbar no-print z-50 lg:ml-auto max-w-[min(100%, 32rem)] m-auto w-full overflow-x-scroll lg:overflow-visible h-56 pointer-events-none"
                style={{ scrollbarWidth: "none" }}
              >
                <div className="flex flex-row flex-wrap lg:flex-col items-start lg:items-end max-w-full justify-between my-4 gap-2 text-sm relative min-w-96">
                  <ButtonPair
                    title={
                      <>
                        {mode !== "guitalele" ? "Transpose" : <span className={GuitaleleStyle}>Guitalele Mode!</span>}
                        {mode === "guitalele" || tranposition === 0 || ` (${formattedTransposition()})`}
                      </>
                    }
                  >
                    <ToolbarButton onClick={() => setTranposition(tranposition - 1)}>
                      <MinusIcon className="w-6 h-6" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => setTranposition(tranposition + 1)}>
                      <PlusIcon className="w-6 h-6" />
                    </ToolbarButton>
                  </ButtonPair>

                  <ButtonPair title={<>Autoscroll {scrollSpeed > 0 && ` (${scrollSpeed})`}</>}>
                    <ToolbarButton onClick={() => changeScrolling("down")} disabled={scrollSpeed < 1}>
                      <MinusIcon className="w-6 h-6" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => changeScrolling("up")}>
                      <PlusIcon className="w-6 h-6" />
                    </ToolbarButton>
                  </ButtonPair>
                  <ButtonPair title="Font size">
                    <ToolbarButton onClick={() => setFontSize(fontSize - 2)} disabled={fontSize < 8}>
                      <span className="text-xs">A</span>
                    </ToolbarButton>
                    <ToolbarButton onClick={() => setFontSize(fontSize + 2)}>
                      <span className="text-2xl">A</span>
                    </ToolbarButton>
                  </ButtonPair>
                  <ButtonPair title="Options">
                    <ToolbarButton onClick={handleSave}>
                      <BookmarkIcon className="w-6 h-6" />
                    </ToolbarButton>
                    {overflowMenu}
                  </ButtonPair>
                </div>
              </div>
            </div>
          </>
          <div className="lg:pt-0 pt-24 z-30 relative w-fit m-auto">
            <TabSheet plainTab={plainTab} fontSize={fontSize} transposition={tranposition} />
          </div>
        </div>

        <hr className="my-4 no-print dark:border-gray-600" />
        <div className="">
          <div className="max-w-lg mx-auto my-4 no-print flex">
            <div>
              {!!tabDetails?.contributors?.length && (
                <details>
                  <summary>{tabDetails?.contributors?.length} Contributors</summary>
                  <ul>
                    {tabDetails?.contributors?.map((c, index) => (
                      <li key={index}>
                        <Link href={`https://www.ultimate-guitar.com/u/${c}`}>{c}</Link>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </div>
        </div>
        {saveDialogActive && <SaveDialog isOpen={saveDialogActive} setIsOpen={setSaveDialogActive} tab={tabLink} />}
      </div>
    </>
  );
}

function ButtonPair({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="flex-1 flex-col text-center pointer-events-auto">
      <p className="text-xs whitespace-nowrap">{title}</p>
      <div className="flex gap-1 m-auto w-fit">{children}</div>
    </div>
  );
}
