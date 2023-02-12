// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { JSDOM } from "jsdom";
import { TabDto } from "@/models";

type Data = {
  tab: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log("req.body", Object.keys(req.body));
  if (Object.keys(req.body).length === 0) {
    res.status(400);
    return;
  }
  console.log(req.body);
  if (req.method === "POST") {
    const url = `https://tabs.ultimate-guitar.com/tab/${req.body["id"]}`;
    const tab = await getTab(url);
    res.status(200).json({ ...tab });
  }
}

async function getTab(URL: string): Promise<TabDto> {
  let songData: TabDto = {
    tab: "",
    name: "",
    artist: "",
  };
  await fetch(URL)
    .then((response) => response.text())
    .then((html) => {
      // Convert the HTML string into a document object
      const dom = new JSDOM(html);
      // Get the image file
      var jsStore = dom.window.document.querySelector(".js-store");
      let dataContent = JSON.parse(
        jsStore?.getAttribute("data-content") || "{}"
      );
      songData.tab =
        dataContent?.store?.page?.data?.tab_view?.wiki_tab?.content;
      songData.name = dataContent?.store?.page?.data?.tab?.song_name;
      songData.artist = dataContent?.store?.page?.data?.tab?.artist_name;
    })
    .catch((err) => {
      // There was an error
      console.warn("Something went wrong.", err);
    });
  return songData;
}
