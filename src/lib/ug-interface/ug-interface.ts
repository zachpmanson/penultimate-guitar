import { blacklist } from "@/constants";
import { AltVersion, NewTab, Song } from "@/models/models";
import { JSDOM } from "jsdom";
import { Contributor } from "./models";
import { SearchResult } from "@/models/models";

export namespace UGAdapter {
  export async function getTab(
    URL: string
  ): Promise<[Song, NewTab, AltVersion[]]> {
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
      type: "Unknown",
    };

    let altVersions: AltVersion[] = [];

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
        tabData.capo =
          dataContent?.store?.page?.data?.tab_view?.meta?.capo ?? 0;
        tabData.version = dataContent?.store?.page?.data?.tab?.version ?? 0;
        tabData.type = dataContent?.store?.page?.data?.tab?.type;

        if (dataContent?.store?.page?.data?.tab?.part) {
          tabData.type = `${tabData.type} ${dataContent?.store?.page?.data?.tab?.part}`;
        }

        tabData.contributors = dataContent?.store?.page?.data?.tab?.username
          ? [dataContent?.store?.page?.data?.tab?.username]
          : [];
        tabData.contributors = [
          ...tabData.contributors,
          ...(dataContent?.store?.page?.data?.tab_view?.contributors?.map(
            (c: Contributor) => c.username
          ) ?? []),
        ];

        altVersions = dataContent?.store?.page?.data?.tab_view?.versions
          .filter((v: AltVersion) => !blacklist.includes(v.type ?? ""))
          .map((v: AltVersion) => ({
            rating: v.rating,
            version: v.version,
            taburl: v.tab_url?.replace(
              "https://tabs.ultimate-guitar.com/tab/",
              ""
            ),
            type: v.type,
          }));
      })
      .catch((err) => {
        console.warn("Something went wrong.", err);
      });

    return [songData, tabData, altVersions];
  }

  export async function getSearch(
    search: string,
    type: string,
    page: number
  ): Promise<SearchResult[]> {
    let cleanSearch = search.replace(
      /\(?(-? ?[0-9]* ?[Rr]emaster(ed)? ?[0-9]*)\)?|(\(-? ?[0-9]* ?[Ss]tereo ?[0-9]*\))/,
      ""
    );
    const URL = `https://www.ultimate-guitar.com/search.php?page=${page}&search_type=${type}&value=${cleanSearch}`;
    let results: SearchResult[] = [];
    await fetch(URL, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/112.0",
      },
    })
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

    return results;
  }
}
