import { TabDto, TabType } from "@/models/models";
import { DEFAULT_TAB } from "@/types/tab";
import { TRPCError } from "@trpc/server";
import { insertTab } from "./insert-tab";
import prisma from "./prisma";
import { UGAdapter } from "./ug-interface/ug-interface";

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
    const fullurl = `https://tabs.ultimate-guitar.com/tab/${input}`;

    const [song, tab, altVersions] = await UGAdapter.getTab(fullurl);
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
  return props;
}
