import Chord from "@/components/chord";
import SearchBox from "@/components/searchbox";
import { TabDto } from "@/models";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import reactStringReplace from "react-string-replace";

export default function Tab() {
  const router = useRouter();
  const { id } = router.query;
  const [tab, setTab] = useState(<></>);
  const [name, setName] = useState("");
  const [artist, setArtist] = useState("");
  useEffect(() => {
    if (typeof id === "object") {
      fetch("/api/tab", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id.join("/") }),
      })
        .then((res) => res.json())
        .then((res: TabDto) => {
          console.log(res);
          setTab(processTab(res.tab));
          setName(res.name);
          setArtist(res.artist);
        });
    }
  }, [id]);

  const processTab = (tabString: string) => {
    let cleanString: string = tabString
      .replace(/\[tab\]/g, "")
      .replace(/\[\/tab\]/g, "");
    console.log("cleanString", cleanString);
    let tabHtml = (
      <pre>
        {reactStringReplace(cleanString, /\[ch\](.+?)\[\/ch\]/g, (match, i) => (
          <Chord chord={match} id={i} />
        ))}
      </pre>
    );
    return tabHtml;
  };

  return (
    <>
      <Head>
        <title>{`${name} - ${artist}`}</title>
      </Head>
      <SearchBox />
      <h1 className="text-center text-2xl">
        {name} - {artist}
      </h1>
      {tab}
    </>
  );
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
