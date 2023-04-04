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
          {allTabs.length} songs
          <ol>
            {allTabs.map((t, i) => (
              <li key={i}>
                <Link href={`/tab/${t.taburl}`}>
                  {t.song.artist} - {t.song.name}
                  {multipleVersions[t.songId] && <span className="font-light text-xs"> (v{t.version})</span>}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  const savedTabs = await prisma.tab.findMany({
    where: {
      tab: {
        not: "ALT",
      },
    },
    include: {
      song: true,
    },
    orderBy: [
      {
        song: {
          name: "asc",
        },
      },
      {
        song: {
          artist: "asc",
        },
      },
    ],
  });

  // const allTabs = savedTabs.map((t) => ({ ...t, ...t.song }));

  return {
    props: { allTabs: savedTabs },
  };
}
