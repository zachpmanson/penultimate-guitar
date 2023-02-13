import LoadingSpinner from "@/components/loadingspinner";
import SearchBox from "@/components/searchbox";
import TabSheet from "@/components/tabsheet";
import useWindowDimensions from "@/hooks/windowdimensions";
import { TabDto, TabLinks } from "@/models";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Tab() {
  const router = useRouter();
  const { id } = router.query;
  const [plainTab, setPlainTab] = useState("initial");
  const [name, setName] = useState("");
  const [artist, setArtist] = useState("");

  // const hardcode = `(link for the vid: https://www.youtube.com/watch?v=2fQot8XdGtc)\r\n\r\n[tab]B7   x-2-1-2-0-2\r\nC/G  3-3-2-0-1-x[/tab]\r\n[ch]D[/ch]*   5-5-4-0-3-0 ([ch]Dadd4add9/A[/ch])\r\n\r\n[Intro]\r\n\r\n[tab]e|------------------------|---------------------------|--------------------------|\r\nB|------------------------|---------------------------|--------------------------|\r\nG|------------------------|-0-0---0-------------------|--------------------------|\r\nD|------2-2---2-1-1-1---1-|---------2-2-2---2-2-2---2-|-------------1-1-1-1------|\r\nA|------------------------|---------------------------|-2-2-2---2----------------|\r\nE|------------------------|---------------------------|--------------------------|[/tab]\r\n\r\n[tab](adjust the speed for the last 3 notes by listening to the song, they&apos;re a bit different)\r\n                                                                                   [ch]B7[/ch]\r\ne|------------------------|---------------------------|--------------------------|-2-2-2-2-2-2-2-2----------|\r\nB|------------------------|---------4---------0-------|--------------------------|-0-0-0-0-0-0-0-0----------|\r\nG|------------------------|---2-4-5---5p4-5-4---4h5p4-|----------0-0---0-0-2-2p0-|-2-2-2-2-2-2-2-2----------|\r\nD|-----------------1-1-1-1/2--------------------------|--5\\4--2--2-0h2-2-0-0-0---|-1-1-1-1-1-1-1-1--1-1-1-1/2\r\nA|------------------------|---------------------------|----------3-3---3-x-x-x---|-2-2-2-2-2-2-2-2--2-2-2-2/3\r\nE|------------------------|---------------------------|----------3-3---3-3-3-3---|-x-x-x-x-x-x-x-x----------|[/tab]\r\n\r\n[tab]e|--------------------------|--------------------------|\r\nB|-------4-7-5------5-------|--------------------------|\r\nG|-2-4-5----------5---5-4/7-|-0-0---0-0-2-2p0--2-2-2-2-|\r\nD|--------------------------|-2-0h2-2-0-0-0----1-1-1-1-|\r\nA|--------------------------|-3-3---3-x-x-x----2-2-2-2-|\r\nE|--------------------------|-3-3---3-3-3-3----x-x-x-x-|[/tab]\r\n\r\n[Verse 1]\r\n[tab][ch]C[/ch]       [ch]B7[/ch]               [ch]Em[/ch]\r\nTake a seat back in your clamshell[/tab]\r\n[tab]`

  useEffect(() => {
    if (typeof id !== "object") return;

    const link: string = id.join("/");

    fetch("/api/tab", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: link }),
    })
      .then((res) => res.json())
      .then((res: TabDto) => {
        setPlainTab(res.tab.slice(0,+window.prompt("nchrs:")).replace(/[\n\r]/g,"\n"));
        setName(res.name);
        setArtist(res.artist);
        const recents: TabLinks = JSON.parse(
          localStorage?.getItem("recents") || "{}"
        );
        recents[link] = { name: res.name, artist: res.artist };
        localStorage.setItem("recents", JSON.stringify(recents));
      });
  }, [hardcode,id]);

  return (
    <>
      <Head>
        <title>{`${name} - ${artist}`}</title>
      </Head>
      <h1 className="m-auto w-fit">
        <Link href="/">Penultimate Guitar</Link>
      </h1>

      <SearchBox />
      {!!name ? (
        <>
          <h1 className="text-center text-2xl">
            {name} - {artist}
          </h1>
          <TabSheet plainTab={plainTab}></TabSheet>
        </>
      ) : (
        <LoadingSpinner />
      )}
    </>
  );
}
