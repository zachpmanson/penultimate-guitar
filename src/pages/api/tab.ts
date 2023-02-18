import type { NextApiRequest, NextApiResponse } from "next";
import { JSDOM } from "jsdom";
import { blacklist, TabDto } from "@/models";

import prisma from "@/lib/prisma";

type ContributorObj = {
  userid: string;
  username: string;
  usergroupid: string;
  iq: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TabDto>
) {
  if (Object.keys(req.body).length === 0) {
    res.status(400);
    return;
  }
  console.log(req.body);
  if (req.method === "POST") {
    const savedTab = await prisma.tab.findFirst({
      where: {
        taburl: String(req.body["id"]),
      },
    });
    if (savedTab) {
      console.log("tab is in db");
      res.status(200).json({
        tab: savedTab.tab,
        taburl: savedTab.taburl,
        capo: savedTab.capo,
        tuning: JSON.parse(savedTab.tuning ?? "{}"),
        contributors: savedTab.contributors,
        name: savedTab.name,
        artist: savedTab.artist ?? "Unknown Artist",
      });
    } else {
      console.log("tab not in db");
      const url = `https://tabs.ultimate-guitar.com/tab/${req.body["id"]}`;
      const tab = await getTab(url);
      res.status(200).json({ ...tab, taburl: req.body["id"] });
      try {
        if (tab.tab !== "") {
          const result = await prisma.tab.create({
            data: {
              taburl: req.body["id"],
              tab: tab.tab,
              artist: tab.artist,
              contributors: tab.contributors ?? "",
              name: tab.name,
              tuning: JSON.stringify(tab?.tuning ?? {}),
              capo: tab?.capo ?? 0,
            },
          });
        }
      } catch (err) {
        console.warn("Something went wrong.", err);
      }
    }
  }
}

async function getTab(URL: string): Promise<TabDto> {
  let songData: TabDto = {
    taburl: "",
    name: "",
    artist: "",
    contributors: [],
    tab: "",
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

      songData.tab =
        dataContent?.store?.page?.data?.tab_view?.wiki_tab?.content.replace(
          /\r\n/g,
          "\n"
        );
      songData.name = dataContent?.store?.page?.data?.tab?.song_name;
      songData.artist = dataContent?.store?.page?.data?.tab?.artist_name;
      songData.tuning = dataContent?.store?.page?.data?.tab_view?.meta?.tuning;
      songData.capo = dataContent?.store?.page?.data?.tab_view?.meta?.capo;
      songData.contributors =
        dataContent?.store?.page?.data?.tab_view?.contributors?.map(
          (c: ContributorObj) => c.username
        );
    })
    .catch((err) => {
      console.warn("Something went wrong.", err);
    });
  return songData;
}
