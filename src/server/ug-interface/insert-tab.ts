import prisma from "@/server/prisma";
import { NewTab, AltVersion } from "@/models/models";
import { DEFAULT_TAB } from "@/types/tab";
import { Song } from "@prisma/client";

export async function insertTab(
  song: Song,
  tab: NewTab,
  altVersions: AltVersion[]
) {
  try {
    // upsert song
    if (!!song.id) {
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
      }
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
            timestamp: new Date().toISOString(),
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

      for (let altVersion of altVersions) {
        prisma.tab
          .upsert({
            where: {
              taburl: altVersion.taburl,
            },
            create: {
              ...DEFAULT_TAB,
              ...altVersion,
              songId: tab.songId,
              tuning: "{}",
              taburl: altVersion.taburl,
              tab: "ALT",
              capo: 0,
              song: undefined,
              timestamp: null,
            },
            update: {},
          })
          .catch((e) =>
            console.error(`Error upserting alt '${altVersion.taburl}':`, e)
          );
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
