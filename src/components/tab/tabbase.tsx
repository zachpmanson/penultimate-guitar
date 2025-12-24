import SaveDialog from "@/components/dialog/savedialog";
import TabSheet from "@/components/tab/tabsheet";
import ToolbarButton, {
  getToolbarButtonStyle,
} from "@/components/tab/toolbarbutton";
import { GuitaleleStyle, ROUTE_PREFIX } from "@/constants";
import useAutoscroll from "@/hooks/useAutoscroll";
import { TabDto, TabLinkDto } from "@/models/models";
import { useConfigStore } from "@/state/config";
import { mapTabDtoToTabLink } from "@/utils/conversion";
import { tabCompareFn } from "@/utils/sort";
import { Menu, Transition } from "@headlessui/react";
import { BookmarkIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import _ from "lodash";
import Head from "next/head";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { useWakeLock } from "react-screen-wake-lock";
import "react-tooltip/dist/react-tooltip.css";

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
  const { scrollSpeed, changeScrolling, setScrollSpeed, isTouching } =
    useAutoscroll(element);

  const { mode, setMode } = useConfigStore();
  const [fontSize, setFontSize] = useState(12);
  const [tranposition, setTranposition] = useState(
    mode === "guitalele" ? -5 : 0,
  );
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
    const onTouchEnd = () =>
      setTimeout(() => (isTouching.current = false), 2000);

    window.addEventListener("touchstart", onTouch);
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("keydown", onTouchEnd);

    const keyDownHandler = (event: KeyboardEvent) => {
      if (
        event.key === " " &&
        (document.activeElement === element.current ||
          document.activeElement?.tagName === "BODY")
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
    return tranposition === 0
      ? ""
      : tranposition < 0
        ? tranposition.toString()
        : `+${tranposition}`;
  };

  const toggleMode = () => {
    if (mode === "guitalele") {
      setTranposition(0);
      setMode("default");
    } else {
      setMode("guitalele");
    }
  };

  let options = (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className={getToolbarButtonStyle(false)}>▼</Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-1 py-1 ">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => toggleMode()}
                  className={`${
                    active
                      ? "bg-blue-700 text-white"
                      : "text-gray-900 dark:text-gray-200"
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                >
                  {mode === "default" ? (
                    <span>
                      Enable{" "}
                      <span className={GuitaleleStyle}>Guitalele Mode</span>
                    </span>
                  ) : (
                    <span>
                      Disable{" "}
                      <span className={GuitaleleStyle}>Guitalele Mode</span>
                    </span>
                  )}
                </button>
              )}
            </Menu.Item>
          </div>
          <div className="px-1 py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => print()}
                  className={`${
                    active
                      ? "bg-blue-700 text-white"
                      : "text-gray-900  dark:text-gray-200"
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                >
                  Print
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link
                  href={`https://tabs.ultimate-guitar.com/tab/${tabDetails.taburl}`}
                  className={`${
                    active
                      ? "bg-blue-700 text-white"
                      : "text-gray-900  dark:text-gray-200"
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm no-underline hover:text-white`}
                >
                  View on Ultimate Guitar
                </Link>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
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
      <div
        ref={element}
        tabIndex={0}
        className="flex flex-col align-middle w-full"
      >
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
                          <Link
                            href={`${ROUTE_PREFIX.TAB}/${t.taburl}`}
                            prefetch={false}
                          >
                            {tabDetails.song.name}
                            <span className="font-light text-xs">
                              {" "}
                              ({t.type}) (v{t.version}){" "}
                            </span>
                          </Link>
                          <div>
                            Rating: {Math.round(t.rating * 100) / 100} / 5.00
                          </div>
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
                Tuning:{" "}
                <span className="font-bold">{tabDetails?.tuning.name}</span>,{" "}
                {tabDetails?.tuning.value}
              </div>
            )}
          </div>
        </div>

        <hr className="my-4 no-print dark:border-gray-600" />

        <div className="relative w-fit max-w-full lg:px-24 min-w-96 m-auto z-0">
          {tabDetails?.tab && (
            <div className="absolute top-0 lg:right-0 w-full  lg:w-fit h-full">
              <div className="bg-white/50 dark:bg-default-dark/50 sticky top-0 top-toolbar dark:top-toolbar no-print z-40 lg:ml-auto w-full max-w-lg m-auto">
                <div className="flex flex-row lg:flex-col justify-between my-4 gap-2 text-sm flex-wrap relative">
                  <div className="flex-1 flex-col text-center">
                    <p className="text-xs whitespace-nowrap">
                      {mode !== "guitalele" ? (
                        "Transpose"
                      ) : (
                        <span className={GuitaleleStyle}>Guitalele Mode!</span>
                      )}
                      {mode === "guitalele" ||
                        tranposition === 0 ||
                        ` (${formattedTransposition()})`}
                    </p>
                    <div className="flex gap-1 m-auto w-fit">
                      <ToolbarButton
                        onClick={() => setTranposition(tranposition - 1)}
                      >
                        <MinusIcon className="w-6 h-6" />
                      </ToolbarButton>
                      <ToolbarButton
                        onClick={() => setTranposition(tranposition + 1)}
                      >
                        <PlusIcon className="w-6 h-6" />
                      </ToolbarButton>
                    </div>
                  </div>

                  <div className="flex-1 flex-col text-center">
                    <p className="text-xs whitespace-nowrap">
                      Autoscroll {scrollSpeed > 0 && ` (${scrollSpeed})`}
                    </p>
                    <div className="flex gap-1 m-auto w-fit">
                      <ToolbarButton
                        onClick={() => changeScrolling("down")}
                        disabled={scrollSpeed < 1}
                      >
                        <MinusIcon className="w-6 h-6" />
                      </ToolbarButton>
                      <ToolbarButton onClick={() => changeScrolling("up")}>
                        <PlusIcon className="w-6 h-6" />
                      </ToolbarButton>
                    </div>
                  </div>
                  <div className="flex-1 flex-col text-center">
                    <p className="text-xs whitespace-nowrap">Font size</p>
                    <div className="flex gap-1 m-auto w-fit">
                      <ToolbarButton
                        onClick={() => setFontSize(fontSize - 2)}
                        disabled={fontSize < 8}
                      >
                        <span className="text-xs">A</span>
                      </ToolbarButton>
                      <ToolbarButton onClick={() => setFontSize(fontSize + 2)}>
                        <span className="text-2xl">A</span>
                      </ToolbarButton>
                    </div>
                  </div>
                  <div className="flex-1 flex-col text-center">
                    <p className="text-xs whitespace-nowrap">Options</p>
                    <div className="flex gap-1 m-auto w-fit">
                      <ToolbarButton onClick={handleSave}>
                        <BookmarkIcon className="w-6 h-6" />
                      </ToolbarButton>
                      {options}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="lg:pt-0 pt-24 z-30 relative">
            <TabSheet
              plainTab={plainTab}
              fontSize={fontSize}
              transposition={tranposition}
            />
          </div>
        </div>

        <hr className="my-4 no-print dark:border-gray-600" />
        <div className="">
          <div className="max-w-lg mx-auto my-4 no-print flex">
            <div>
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
            </div>
          </div>
        </div>
        {saveDialogActive && (
          <SaveDialog
            isOpen={saveDialogActive}
            setIsOpen={setSaveDialogActive}
            tab={tabLink}
          />
        )}
      </div>
    </>
  );
}
