import SearchBox from "@/components/searchbox";
import TabSheet from "@/components/tabsheet";
import useWindowDimensions from "@/hooks/windowdimensions";
import { TabDto } from "@/models";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Tab() {
  const router = useRouter();
  const { id } = router.query;
  const [plainTab, setPlainTab] = useState("");
  const [name, setName] = useState("");
  const [artist, setArtist] = useState("");

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
        setPlainTab(res.tab);
        setName(res.name);
        setArtist(res.artist);
      });
  }, [id]);

  return (
    <>
      <Head>
        <title>{`${name} - ${artist}`}</title>
      </Head>
      <SearchBox />
      <h1 className="text-center text-2xl">
        {name} - {artist}
      </h1>
      <TabSheet plainTab={plainTab}></TabSheet>
    </>
  );
}
