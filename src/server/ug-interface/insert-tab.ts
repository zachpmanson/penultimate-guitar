import prisma from "@/server/prisma";
import { NewTab, AltVersion } from "@/models/models";
import { DEFAULT_TAB } from "@/types/tab";
import { Song } from "@prisma/client";

export async function upsertNewTab(tab: NewTab) {
  console.log(`Inserting tab '${tab.taburl}' with songId ${tab.songId}`);
  const originalId = Number(tab.taburl.split("-").at(-1));
  if (isNaN(originalId) || !originalId) throw new Error("Invalid taburl");

  return await prisma.tab
    .upsert({
      where:
        tab.tab === "ALT"
          ? {
              taburl: tab.taburl,
              tab: "ALT",
            }
          : { taburl: tab.taburl },
      create: {
        songId: tab.songId,
        taburl: tab.taburl,
        tab: tab.tab,
        contributors: tab.contributors,
        capo: tab.capo,
        tuning: JSON.stringify(tab?.tuning ?? {}),
        rating: tab.rating,
        version: tab.version,
        type: tab.type,
        timestamp: new Date().toISOString(),
        originalId: originalId,
      },
      update: {
        tab: tab.tab,
        contributors: tab.contributors,
        tuning: JSON.stringify(tab?.tuning ?? {}),
        capo: tab.capo ?? 0,
        timestamp: new Date().toISOString(),
        type: tab.type,
      },
    })
    .catch((e) => console.error(`Error upserting tab '${tab.taburl}':`, e));
}

export async function insertTab(
  song: Song,
  tab: NewTab,
  altVersions: AltVersion[]
) {
  try {
    // upsert song
    console.log(`Upserting song '${song.id}'`);

    try {
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
    } catch (e) {
      console.error(`Error upserting song '${song.id}':`, e);
      throw e;
    }

    // insert tab
    console.log("song", song);
    if (!!tab.tab) {
      upsertNewTab(tab).then();
      console.log("altVersions", altVersions);
      for (let altVersion of altVersions) {
        upsertNewTab({
          ...DEFAULT_TAB,
          ...altVersion,
          tuning: undefined,
          taburl: altVersion.taburl,
          tab: "ALT",
          capo: 0,
          contributors: [],
          songId: song.id,
        }).then();
      }
    }

    const taburls = [
      tab.taburl,
      ...altVersions.map((altVersion) => altVersion.taburl),
    ];
    prisma.possibleSong
      .updateMany({
        where: {
          taburl: {
            in: taburls,
          },
        },
        data: {
          songId: song.id,
        },
      })
      .catch((e) => {
        console.error("Error updating possibleSong", e);
      });
  } catch (err) {
    console.warn("Insertion failed.", err);
  }
}
