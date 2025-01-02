import { blacklist } from "@/constants";
import { AltVersion, NewTab, SearchResult, Song } from "@/models/models";
import { JSDOM } from "jsdom";
import { Contributor } from "./models";

export namespace UGAdapter {
  export async function getTab(
    taburl: string
  ): Promise<[Song, NewTab, AltVersion[]]> {
    let songData: Song = {
      id: 0,
      name: "",
      artist: "",
    };

    let tabData: NewTab = {
      taburl: taburl,
      songId: 0,
      contributors: [],
      capo: 0,
      tab: "",
      rating: -1,
      version: -1,
      type: "Unknown",
    };

    let altVersions: AltVersion[] = [];

    console.log("Fetching", `https://tabs.ultimate-guitar.com/tab/${taburl}`);
    await fetch(`https://tabs.ultimate-guitar.com/tab/${taburl}`)
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
        songData = {
          id: dataContent?.store?.page?.data?.tab?.song_id,
          name: dataContent?.store?.page?.data?.tab?.song_name,
          artist: dataContent?.store?.page?.data?.tab?.artist_name,
        };

        tabData = {
          taburl: tabData.taburl,
          tab:
            dataContent?.store?.page?.data?.tab_view?.wiki_tab?.content.replace(
              /\r\n/g,
              "\n"
            ) ?? "",
          songId: songData.id,
          tuning: dataContent?.store?.page?.data?.tab_view?.meta?.tuning ?? {},
          rating: dataContent?.store?.page?.data?.tab?.rating ?? -1,
          capo: dataContent?.store?.page?.data?.tab_view?.meta?.capo ?? 0,
          version: dataContent?.store?.page?.data?.tab?.version ?? 0,
          type: dataContent?.store?.page?.data?.tab?.part
            ? `${tabData.type} ${dataContent?.store?.page?.data?.tab?.part}`
            : dataContent?.store?.page?.data?.tab?.type,
          contributors: (dataContent?.store?.page?.data?.tab?.username
            ? [dataContent?.store?.page?.data?.tab?.username]
            : []
          ).concat(
            dataContent?.store?.page?.data?.tab_view?.contributors?.map(
              (c: Contributor) => c.username
            ) ?? []
          ),
        };
        console.log(
          "dataContent?.store?.page?.data?.tab_view?.versions",
          dataContent?.store?.page?.data?.tab_view?.versions
        );
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
        // console.log(altVersions);
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
  ): Promise<{ items: SearchResult[]; nextCursor?: number }> {
    if (search.length < 3) return { items: [], nextCursor: undefined };

    let cleanSearch = search.replace(
      /\(?(-? ?[0-9]* ?[Rr]emaster(ed)? ?[0-9]*)\)?|(\(-? ?[0-9]* ?[Ss]tereo ?[0-9]*\))/,
      ""
    );
    const URL = `https://www.ultimate-guitar.com/search.php?page=${page}&search_type=${type}&value=${cleanSearch}`;
    let results: SearchResult[] = [];
    try {
      const html = await fetch(URL, {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/112.0",
        },
      }).then((response) => response.text());
      const dom = new JSDOM(html);
      let jsStore = dom.window.document.querySelector(".js-store");
      let dataContent = JSON.parse(
        jsStore?.getAttribute("data-content")?.replace(/&quot;/g, '"') || "{}"
      );
      let foundResults = dataContent?.store?.page?.data?.results;
      if (foundResults !== undefined) results = foundResults;
    } catch (err) {
      console.warn("Something went wrong.", err);
      throw err;
    }

    results = results
      .filter((r) => r.tab_access_type === "public")
      .filter((r) => !blacklist.includes(r.type))
      .map((r) => ({ ...r, tab_url: r.tab_url.split("/tab/")[1] }))
      .sort((a: SearchResult, b: SearchResult) => b.rating - a.rating);
    console.log(`Search '${cleanSearch}' found ${results.length}`);
    return {
      items: results.map((i) => ({ ...i, internal: false })),
      nextCursor: results.length > 25 ? page + 1 : undefined,
    };
  }
}
