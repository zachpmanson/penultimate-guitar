import SaveDialog from "@/components/dialog/savedialog";
import TabSheet from "@/components/tab/tabsheet";
import ToolbarButton from "@/components/tab/toolbarbutton";
import { useGlobal } from "@/contexts/Global/context";
import { convertToTabLink } from "@/lib/conversion";
import prisma from "@/lib/prisma";
import { getTab } from "@/lib/ug-interface/ug-interface";
import {
  AltVersion,
  NewTab,
  Song,
  TabDto,
  TabLinkDto,
  TabType,
} from "@/models";
import _ from "lodash";
import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import "react-tooltip/dist/react-tooltip.css";
const scrollMs = 100;

type TabProps = {
  tabDetails: TabDto;
};

export default function Tab({ tabDetails }: TabProps) {
  const router = useRouter();
  const { id } = router.query;
  const [fontSize, setFontSize] = useState(12);
  const [tranposition, setTranposition] = useState(0);
  const [scrollSpeed, setScrollSpeed] = useState(0);
  const scrollinterval = useRef<NodeJS.Timer>();
  const [saveDialogActive, setSaveDialogActive] = useState(false);

  const plainTab = tabDetails.tab;
  const tabLink = convertToTabLink(tabDetails);

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
  }, [id, tabDetails]);

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
            top: scrollSpeed,
            left: 0,
            behavior: "smooth",
          }),
        scrollMs
      );
    }
    return () => {
      clearInterval(scrollinterval.current);
    };
  }, [scrollSpeed]);

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

  return (
    <div>
      <Head>
        <title>
          {tabDetails.song.name
            ? `${tabDetails.song.name} ${
                tabDetails.song.artist && "- " + tabDetails.song.artist
              }`
            : "Penultimate Guitar"}
        </title>
      </Head>
      <>
        <h1 className="text-center text-2xl my-4">
          <span className="font-medium">{tabDetails.song.name}</span>
          <span className="font-light">{` ${
            tabDetails.song.artist && "- " + tabDetails.song.artist
          }`}</span>
        </h1>
        <div className="max-w-lg mx-auto my-4">
          {(tabDetails?.song?.Tab?.length ?? 1) > 1 && (
            <details>
              <summary>
                Version {tabDetails?.version} of {tabDetails.song.Tab?.length}
              </summary>

              <ul>
                {tabDetails.song.Tab?.map((t, index) => (
                  <li key={index}>
                    {t.taburl === tabDetails.taburl || (
                      <div className="flex gap-8">
                        <Link href={t.taburl} prefetch={false}>
                          {tabDetails.song.name} Version {t.version}{" "}
                        </Link>
                        Rating: {Math.round(t.rating * 100) / 100} / 5.00
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
        <hr className="my-4" />

        {tabDetails?.tab && (
          <div className="bg-white/50 w-full sticky top-0 ">
            <div className="flex justify-between max-w-lg mx-auto my-4 gap-4 text-sm flex-wrap">
              <div className="flex-1 flex-col text-center">
                <p className="text-xs whitespace-nowrap">Save</p>
                <div className="m-auto w-fit">
                  <ToolbarButton onClick={handleSave}>💾</ToolbarButton>
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
                <p className="text-xs whitespace-nowrap">
                  Transpose
                  {tranposition === 0 || ` (${formattedTransposition()})`}
                </p>
                <div className="flex gap-1 m-auto w-fit">
                  <ToolbarButton
                    onClick={() => setTranposition(tranposition - 1)}
                  >
                    ➖
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() => setTranposition(tranposition + 1)}
                  >
                    ➕
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
                    ➖
                  </ToolbarButton>
                  <ToolbarButton onClick={() => changeScrolling("up")}>
                    ➕
                  </ToolbarButton>
                </div>
              </div>
            </div>
          </div>
        )}

        <TabSheet
          plainTab={plainTab}
          fontSize={fontSize}
          transposition={tranposition}
        ></TabSheet>

        <hr className="my-4" />
        <div className="max-w-lg mx-auto my-4">
          {!!tabDetails?.contributors?.length && (
            <details>
              <summary>{tabDetails?.contributors?.length} Contributors</summary>
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
        <SaveDialog
          isOpen={saveDialogActive}
          setIsOpen={setSaveDialogActive}
          tab={tabLink}
        />
      </>
    </div>
  );
}

export async function getStaticPaths() {
  const savedTabs = await prisma.tab.findMany({
    where: {
      tab: {
        not: "ALT",
      },
    },
    select: {
      taburl: true,
    },
  });

  const paths = savedTabs.map((tab) => ({
    params: { id: tab.taburl.split("/") },
  }));

  return { paths, fallback: "blocking" };
}

const defaultProps: TabDto = {
  taburl: "",
  song: { id: 0, name: "", artist: "" },
  contributors: [],
  capo: 0,
  tab: "",
  version: 0,
  songId: 0,
  rating: 0,
  type: "Tab",
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (params?.id?.length !== 2) {
    return {
      notFound: true,
    };
  }

  let props: TabDto = {
    ...defaultProps,
  };

  if (typeof params.id === "object") {
    const url = params.id.join("/");

    const savedTab = await prisma.tab.findUnique({
      where: {
        taburl: url,
      },
      include: {
        song: {
          include: {
            Tab: {
              select: {
                taburl: true,
                version: true,
                rating: true,
              },
            },
          },
        },
      },
    });

    if (savedTab?.tab && savedTab?.tab !== "ALT") {
      props = {
        ...savedTab,
        type: savedTab.type as TabType,
        tuning: JSON.parse(savedTab.tuning ?? "{}"),
      };
    } else {
      const fullurl = `https://tabs.ultimate-guitar.com/tab/${url}`;
      const [song, tab, altVersions] = await getTab(fullurl);
      tab.taburl = url;
      props = {
        ...tab,
        song: { ...song, Tab: [...altVersions, tab] },
      };
      insertTab(song, tab, altVersions);
    }
  }
  if (!props.song.name) {
    return {
      notFound: true,
    };
  }

  return { props: { tabDetails: props } };
};

async function insertTab(song: Song, tab: NewTab, altVersions: AltVersion[]) {
  try {
    // upsert song
    if (!!song.id) {
      // left as await since later tab insertion needs songId
      await prisma.song.upsert({
        where: {
          id: song.id,
        },
        create: {
          id: song.id,
          name: song.name,
          artist: song.artist,
        },
        update: {},
      });
    }

    // insert tab
    if (!!tab.tab) {
      prisma.tab
        .upsert({
          where: {
            taburl: tab.taburl,
          },
          create: {
            ...tab,
            tuning: JSON.stringify(tab?.tuning ?? {}),
            capo: tab.capo ?? 0,
          },
          update: {
            tab: tab.tab,
            contributors: tab.contributors,
            tuning: JSON.stringify(tab?.tuning ?? {}),
            capo: tab.capo ?? 0,
          },
        })
        .then();

      for (let altVersion of altVersions) {
        prisma.tab
          .upsert({
            where: {
              taburl: altVersion.taburl,
            },
            create: {
              ...defaultProps,
              ...altVersion,
              songId: tab.songId,
              tuning: "{}",
              taburl: altVersion.taburl,
              tab: "ALT",
              capo: 0,
              song: undefined,
            },
            update: {},
          })
          .then();
      }
    }
  } catch (err) {
    console.warn("Insertion failed.", err);
  }
}
