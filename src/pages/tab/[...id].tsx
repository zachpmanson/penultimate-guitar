import Chord from "@/components/chord";
import SearchBox from "@/components/searchbox";
import useWindowDimensions from "@/hooks/windowdimensions";
import { TabDto } from "@/models";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import reactStringReplace from "react-string-replace";

export default function Tab() {
  const router = useRouter();
  const { id } = router.query;
  const [tab, setTab] = useState(<></>);
  const [plainTab, setPlainTab] = useState("");
  const [name, setName] = useState("");
  const [artist, setArtist] = useState("");

  const { width } = useWindowDimensions();
  useEffect(() => {
    if (typeof id !== "object") return;

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
        setPlainTab(res.tab);
        setName(res.name);
        setArtist(res.artist);
      });
  }, [id]);

  useEffect(() => {
    const maxLineLen = Math.max(
      ...plainTab.split("\n").map((l: string) => l.length)
    );

    setTab(processTab(plainTab, maxLineLen, width));
  }, [plainTab, width]);

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

const processTab = (tabString: string, maxLineLen: number, width: number) => {
  let cleanString: string = tabString
    .replace(/\[tab\]/g, "")
    .replace(/\[\/tab\]/g, "");
  console.log("cleanString", cleanString);
  let tabHtml = (
    <div
      className="tab m-auto w-fit"
      style={{ fontSize: Math.min(14, (1.5 * width) / maxLineLen) }}
    >
      <pre>
        {reactStringReplace(cleanString, /\[ch\](.+?)\[\/ch\]/g, (match, i) => (
          <Chord chord={match} id={i} />
        ))}
      </pre>
    </div>
  );
  return tabHtml;
};
