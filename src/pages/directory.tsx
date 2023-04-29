import prisma from "@/lib/prisma";
import { TabDto } from "@/models";
import Head from "next/head";
import Link from "next/link";

type ListProps = {
  allTabs: TabDto[];
};

export default function Directory({ allTabs }: ListProps) {
  const multipleVersions: { [key: string]: boolean } = {};
  for (let tab of allTabs) {
    if (multipleVersions[tab.songId] === undefined) {
      multipleVersions[tab.songId] = false;
    } else if (multipleVersions[tab.songId] === false) {
      multipleVersions[tab.songId] = true;
    }
  }
  return (
    <>
      <Head>
        <title>Song Directory</title>
      </Head>
      <div className="w-fit m-auto wrap">
        <div className="mx-8">
          {Object.keys(multipleVersions).length} songs, {allTabs.length} tabs
          <ol className=" max-w-xl">
            {allTabs.map((t, i) => (
              <li key={i}>
                <Link href={`/tab/${t.taburl}`} prefetch={false}>
                  {t.song.artist} - {t.song.name}
                  {multipleVersions[t.songId] && (
                    <span className="font-light text-xs">
                      {" "}
                      (v{t.version}) ({t.type})
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}

export async function getStaticProps() {
  const savedTabs = await prisma.tab.findMany({
    where: {
      tab: {
        not: "ALT",
      },
    },
    select: {
      taburl: true,
      songId: true,
      type: true,
      version: true,
      song: true,
    },
    orderBy: [
      {
        song: {
          artist: "asc",
        },
      },
      {
        song: {
          name: "asc",
        },
      },
      {
        version: "asc",
      },
    ],
  });

  return {
    props: { allTabs: savedTabs },
    revalidate: 60,
  };
}
