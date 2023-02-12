import Chord from "@/components/chord";
import SearchBox from "@/components/searchbox";
import { TabDto } from "@/models";
import Head from "next/head";
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
