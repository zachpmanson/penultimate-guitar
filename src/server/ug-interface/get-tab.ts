import { AltVersion, TabDto, TabType } from "@/models/models";
import { DEFAULT_TAB } from "@/types/tab";
import { TRPCError } from "@trpc/server";
import prisma from "../prisma";
import { insertTab } from "./insert-tab";
import { UGAdapter } from "./ug-interface";

export async function getTab(taburl: string) {
  let props: TabDto = DEFAULT_TAB;

  let savedTab: any;
  try {
    savedTab = await prisma.tab.findUnique({
      where: {
        taburl: taburl,
      },
      include: {
        song: {
          include: {
            Tab: {
              select: {
                taburl: true,
                version: true,
                rating: true,
                type: true,
              },
            },
          },
        },
      },
    });
  } catch (e) {
    console.error("Find unique failed", e);
  }

  if (savedTab?.tab && savedTab?.tab !== "ALT") {
    props = {
      ...savedTab,
      type: savedTab.type as TabType,
      tuning: JSON.parse(savedTab.tuning ?? "{}"),
    };
  } else {
    const [song, tab, altVersions] = await UGAdapter.getTab(taburl);
    if (tab.songId === undefined) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Couldn't find tab.",
        // optional: pass the original error to retain stack trace
        // cause: theError,
      });
    }
    tab.taburl = taburl;
    props = {
      ...tab,
      song: { ...song, Tab: [...altVersions, tab] },
    };
    insertTab(song, tab, altVersions).catch(() =>
      console.error("Database error occured for", tab.taburl)
    );
  }
  console.log(props);
  return props;
}

export async function getHighestRatedTab(taburl: string) {
  // TODO use internal ratings if they exist
  let savedTab: any;
  try {
    savedTab = await prisma.tab.findUnique({
      where: {
        taburl: taburl,
      },
      include: {
        song: {
          include: {
            Tab: {
              select: {
                taburl: true,
                version: true,
                rating: true,
                type: true,
              },
            },
          },
        },
      },
    });
  } catch (e) {
    console.error("Find unique failed", e);
  }

  if (savedTab) {
    const rankings: AltVersion[] = [
      {
        taburl: savedTab.taburl,
        rating: savedTab.rating,
        type: savedTab.type,
        version: savedTab.version,
      },
      ...savedTab.song.Tab.map((v: any) => ({
        taburl: v.taburl,
        rating: v.rating,
        type: v.type,
        version: v.version,
      })),
    ].sort((a, b) => b.rating - a.rating);

    return rankings;
  } else {
    const [song, tab, altVersions] = await UGAdapter.getTab(taburl);
    insertTab(song, tab, altVersions).catch(() =>
      console.error("Database error occured for", tab.taburl)
    );

    const rankings: AltVersion[] = [
      {
        taburl: tab.taburl,
        rating: tab.rating,
        type: tab.type,
        version: tab.version,
      },
      ...altVersions,
    ].sort((a, b) => b.rating - a.rating);

    return rankings;
  }
}
