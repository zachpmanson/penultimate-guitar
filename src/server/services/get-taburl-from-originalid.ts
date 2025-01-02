import { TabDto } from "@/models/models";
import { DEFAULT_TAB } from "@/types/tab";
import prisma from "../prisma";
import { UGApi } from "../ug-interface/ug-api";
import { mapApiResultToTabDto } from "@/utils/conversion";
import { insertTab, upsertNewTab } from "../ug-interface/insert-tab";

export async function getTabFromOriginalId(originalId: number) {
  return await prisma.possibleSong.findFirst({
    where: {
      originalId: originalId,
    },
  });
}

export async function getTabDetailsFromOriginalId(originalId: number) {
  let tab: TabDto = DEFAULT_TAB;

  const existingTab = await prisma.tab.findFirst({
    where: {
      originalId: originalId,
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

  if (existingTab && existingTab.tab !== "ALT") {
    tab = {
      ...existingTab,
      tuning: JSON.parse(existingTab.tuning ?? "{}"),
      song: {
        ...existingTab.song,
        id: existingTab.songId,
      },
    };

    return tab;
  }

  const tabApiPayload = await UGApi.getTab({
    tab_id: originalId,
  });

  if (!tabApiPayload) throw new Error("Couldn't find tab");

  const tabDto = mapApiResultToTabDto(tabApiPayload);
  insertData(tabApiPayload, tabDto).then();

  return tabDto;
}

async function insertData(tabApiPayload: UGApi.TabInfo, tabDto: TabDto) {
  const taburlsFromAlts = await prisma.possibleSong.findMany({
    where: {
      originalId: {
        in: tabApiPayload.versions.map((v) => v.id),
      },
    },
    select: {
      taburl: true,
      originalId: true,
    },
  });
  const idToTaburl = Object.fromEntries(
    taburlsFromAlts.map((t) => [t.originalId, t.taburl])
  );
  console.log(taburlsFromAlts);
  insertTab(
    {
      id: tabApiPayload.song_id,
      artist: tabApiPayload.artist_name,
      name: tabApiPayload.song_name,
    },
    tabDto,
    tabApiPayload.versions
      .filter((v) => idToTaburl[v.id])
      .map((v) => ({
        ...v,
        taburl: idToTaburl[v.id],
      }))
  ).then();
}
