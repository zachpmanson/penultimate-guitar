import TabSheet from "@/components/tab/tabsheet";
import ToolbarButton from "@/components/tab/toolbarbutton";
import { useGlobal } from "@/contexts/Global/context";
import { blacklist, ContributorObj, TabDto, TabLinkProps } from "@/models";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import "react-tooltip/dist/react-tooltip.css";
import _ from "lodash";
import prisma from "@/lib/prisma";
import { JSDOM } from "jsdom";

const scrollMs = 50;

type TabProps = {
  tabDetails: TabDto;
};

export default function Tab({ tabDetails }: TabProps) {
  const router = useRouter();
  const { id } = router.query;
  const plainTab = tabDetails.tab;
  const [fontSize, setFontSize] = useState(12);
  const [tranposition, setTranposition] = useState(0);
  const [scrollSpeed, setScrollSpeed] = useState(0);
  const scrollinterval = useRef<NodeJS.Timer>();
  const { addPinnedTab, removePinnedTab, isPinned } = useGlobal();

  useEffect(() => {
    const recents: any = JSON.parse(localStorage?.getItem("recents") || "{}");
    if (Array.isArray(recents)) {
      recents.unshift({
        taburl: tabDetails.taburl,
        name: tabDetails.name,
        artist: tabDetails.artist,
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
        taburl: tabDetails.taburl,
        name: tabDetails.name,
        artist: tabDetails.artist,
      });

      const uniqRecents = _.uniqBy(arrayRecents, (r: TabLinkProps) => r.taburl);

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
            ? `${tabDetails?.name} ${
                tabDetails?.artist && "- " + tabDetails?.artist
              }`
            : "Penultimate Guitar"}
        </title>
      </Head>
      <>
        <h1 className="text-center text-2xl my-4">
          <span className="font-medium">{tabDetails?.name}</span>
          <span className="font-light">
            {` ${tabDetails?.artist && "- " + tabDetails?.artist}`}
          </span>
        </h1>
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

          {!!tabDetails?.capo && <div>Capo: Fret {tabDetails?.capo}</div>}
          {!!tabDetails?.tuning?.value && (
            <div>
              Tuning:{" "}
              <span className="font-bold">{tabDetails?.tuning.name}</span>,{" "}
              {tabDetails?.tuning.value}
            </div>
          )}
        </div>
        {tabDetails?.tab && (
          <div className="bg-white/50 w-full sticky top-0 ">
            <div className="flex justify-between max-w-lg mx-auto my-4 gap-4 text-sm flex-wrap">
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
                    icon={<span className="text-xs">A</span>}
                    disabled={fontSize < 8}
                  />
                  <ToolbarButton
                    fn={() => setFontSize(fontSize + 2)}
                    icon={<span className="text-2xl">A</span>}
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
                  <ToolbarButton
                    fn={() => changeScrolling("down")}
                    icon="➖"
                    disabled={scrollSpeed < 1}
                  />
                  <ToolbarButton fn={() => changeScrolling("up")} icon="➕" />
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
      </>
    </div>
  );
}

type ServerProps = {
  params: { id: string | string[] };
};

export async function getServerSideProps({ params }: ServerProps) {
  let defaultProps: TabDto = {
    taburl: "",
    name: "",
    artist: "",
    contributors: [],
    capo: 0,
    tab: "",
  };
  let props: TabDto = {
    ...defaultProps,
  };
  if (typeof params.id === "object") {
    const url = params.id.join("/");

    const savedTab = await prisma.tab.findFirst({
      where: {
        taburl: url,
      },
      include: {
        song: true,
      },
    });

    if (savedTab) {
      console.log("tab is in db");
      props = {
        tab: savedTab.tab,
        taburl: savedTab.taburl,
        capo: savedTab.capo,
        tuning: JSON.parse(savedTab.tuning ?? "{}"),
        contributors: savedTab.contributors,
        name: savedTab.song.name,
        artist: savedTab.song.artist ?? "Unknown Artist",
      };
    } else {
      console.log("tab not in db");
      const fullurl = `https://tabs.ultimate-guitar.com/tab/${url}`;
      const [song, tab] = await getTab(fullurl);
      tab.taburl = url;
      props = {
        ...tab,
        ...song,
      };
      try {
        // upsert song
        if (!!song.id) {
          const result = await prisma.song.upsert({
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
          const result = await prisma.tab.create({
            data: {
              songId: tab.songId,
              taburl: tab.taburl,
              tab: tab.tab,
              contributors: tab.contributors,
              tuning: JSON.stringify(tab?.tuning ?? {}),
              capo: tab.capo ?? 0,
              rating: tab.rating,
              version: tab.version,
            },
          });
        }
      } catch (err) {
        console.warn("Something went wrong.", err);
      }
    }
  }
  if (!props.name) {
    props = { ...defaultProps, name: "Song not found" };
  }
  return { props: { tabDetails: props } };
}

type Song = {
  id: number;
  name: string;
  artist: string;
};
type NewTab = {
  taburl: string;
  tab: string;
  songId: number;
  contributors: string[];
  capo: number;
  tuning?: {
    name: string;
    value: string;
    index: number;
  };
  rating: number;
  version: number;
};
async function getTab(URL: string): Promise<[Song, NewTab]> {
  let songData: Song = {
    id: 0,
    name: "",
    artist: "",
  };

  let tabData: NewTab = {
    taburl: "",
    songId: 0,
    contributors: [],
    capo: 0,
    tab: "",
    rating: -1,
    version: -1,
  };

  console.log("Fetching", URL);
  await fetch(URL)
    .then((response) => response.text())
    .then((html) => {
      const dom = new JSDOM(html);
      let jsStore = dom.window.document.querySelector(".js-store");
      let dataContent = JSON.parse(
        jsStore?.getAttribute("data-content") || "{}"
      );
      if (blacklist.includes(dataContent?.store?.page?.data?.tab?.type)) {
        songData.name = "Couldn't display tab type";
        songData.artist = dataContent?.store?.page?.data?.tab?.type;
        return;
      }

      songData.id = dataContent?.store?.page?.data?.tab?.song_id;
      songData.name = dataContent?.store?.page?.data?.tab?.song_name;
      songData.artist = dataContent?.store?.page?.data?.tab?.artist_name;

      tabData.tab =
        dataContent?.store?.page?.data?.tab_view?.wiki_tab?.content.replace(
          /\r\n/g,
          "\n"
        ) ?? "";
      tabData.songId = songData.id;
      tabData.tuning =
        dataContent?.store?.page?.data?.tab_view?.meta?.tuning ?? {};
      tabData.rating = dataContent?.store?.page?.data?.tab?.rating ?? -1;
      tabData.capo = dataContent?.store?.page?.data?.tab_view?.meta?.capo ?? 0;
      tabData.version = dataContent?.store?.page?.data?.tab?.version ?? 0;
      tabData.contributors =
        dataContent?.store?.page?.data?.tab_view?.contributors?.map(
          (c: ContributorObj) => c.username
        ) ?? {};
    })
    .catch((err) => {
      console.warn("Something went wrong.", err);
    });
  return [songData, tabData];
}
