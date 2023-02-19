import { blacklist, SearchResult } from "@/models";
import { JSDOM } from "jsdom";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = SearchResult[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // console.log("req.body", Object.keys(req.body));
  if (Object.keys(req.body).length === 0) {
    res.status(400);
    return;
  }
  // console.log(req.body);
  if (req.method === "POST") {
    const url = `https://www.ultimate-guitar.com/search.php?search_type=${req.body["search_type"]}&value=${req.body["value"]}`;
    const results = await getSearch(url);
    res.status(200).json([...results]);
  }
}

async function getSearch(URL: string): Promise<SearchResult[]> {
  let results: SearchResult[] = [];
  await fetch(URL)
    .then((response) => response.text())
    .then((html) => {
      const dom = new JSDOM(html);
      let jsStore = dom.window.document.querySelector(".js-store");
      let dataContent = JSON.parse(
        jsStore?.getAttribute("data-content")?.replace(/&quot;/g, '"') || "{}"
      );
      let foundResults = dataContent?.store?.page?.data?.results;
      if (foundResults !== undefined) results = foundResults;
    })
    .catch((err) => {
      console.warn("Something went wrong.", err);
    });

  results = results
    .filter((r) => r.tab_access_type === "public")
    .filter((r) => !blacklist.includes(r.type))
    .map((r) => ({ ...r, tab_url: r.tab_url.split("/tab/")[1] }))
    .sort((a: SearchResult, b: SearchResult) => b.rating - a.rating);
  console.log(results);
  return results;
}
