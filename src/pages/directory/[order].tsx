import prisma from "@/lib/prisma";
import { Song } from "@prisma/client";
import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

type ListProps = {
  allTabs: {
    songId: number;
    taburl: string;
    type: string;
    version: number;
    song: Song;
    timestamp: string;
  }[];
};

export default function Directory({ allTabs }: ListProps) {
  const router = useRouter();
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
        <div className="">
          <select
            className="p-2 rounded-md float-right"
            name="order"
            id="order"
            defaultValue={router.query.order}
            onChange={(e) => router.push(`/directory/${e.target.value}`)}
          >
            <option key="artist" value="artist">
              By artist
            </option>
            <option key="new" value="new">
              By newest
            </option>
            <option key="old" value="old">
              By oldest
            </option>
          </select>
          <div>
            {Object.keys(multipleVersions).length} songs, {allTabs.length} tabs
          </div>
        </div>
        <div className="mx-8">
          <ol className=" max-w-xl">
            {allTabs.map((t, i) => (
              <li key={i}>
                <Link
                  href={`/tab/${t.taburl}`}
                  prefetch={false}
                  title={t.timestamp}
                >
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

export async function getStaticPaths() {
  const paths = [
    { params: { order: "artist" } },
    { params: { order: "new" } },
    { params: { order: "old" } },
  ];

  return { paths, fallback: "blocking" };
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  let order = params?.order ?? "artist";
  let orderBy =
    order === "artist"
      ? [
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
            type: "asc",
          },
          {
            version: "asc",
          },
        ]
      : [
          {
            timestamp: "asc",
          },
        ];

  let savedTabs = await prisma.tab.findMany({
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
      timestamp: true,
    },
    orderBy: orderBy as any,
  });

  if (order == "new") {
    savedTabs = savedTabs.reverse();
  }

  return {
    props: { allTabs: savedTabs },
    revalidate: 60,
  };
};
