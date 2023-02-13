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

  const hardcode = `B7   x-2-1-2-0-2

  C/G  3-3-2-0-1-x
  
  D*   5-5-4-0-3-0 (Dadd4add9/A)
  
   
  
  [Intro]
  
   
  
  e|------------------------|---------------------------|--------------------------|
  
  B|------------------------|---------------------------|--------------------------|
  
  G|------------------------|-0-0---0-------------------|--------------------------|
  
  D|------2-2---2-1-1-1---1-|---------2-2-2---2-2-2---2-|-------------1-1-1-1------|
  
  A|------------------------|---------------------------|-2-2-2---2----------------|
  
  E|------------------------|---------------------------|--------------------------|
  `

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
        setPlainTab(hardcode);
        setName(res.name);
        setArtist(res.artist);
        const recents: TabLinks = JSON.parse(
          localStorage?.getItem("recents") || "{}"
        );
        recents[link] = { name: res.name, artist: res.artist };
        localStorage.setItem("recents", JSON.stringify(recents));
      });
  }, [id]);

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
