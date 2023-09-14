import { useGlobal } from "@/contexts/Global/context";
import prisma from "@/lib/prisma";
import { Song } from "@prisma/client";
import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

type TabMetadata = {
  songId: number;
  taburl: string;
  type: string;
  version: number;
  song: Song;
  timestamp: string;
};

type ListProps = {
  allTabs: TabMetadata[];
  totalSongs: number;
  totalTabs: number;
};

export default function Directory({
  allTabs,
  totalSongs,
  totalTabs,
}: ListProps) {
  const router = useRouter();
  const { page, order } = router.query;
  let orderName = order ?? "new";
  const pageNum = +(page ?? 1);
  const { searchText, setSearchText } = useGlobal();

  useEffect(() => {
    setSearchText("");
  }, [setSearchText]);

  if (searchText.length >= 3) {
    let lowerSearch = searchText.toLowerCase();
    allTabs = allTabs.filter(
      (t) =>
        t.song.name.toLowerCase().includes(lowerSearch) ||
        t.song.artist.toLowerCase().includes(lowerSearch)
    );
  }

  const pageCount = Math.ceil(totalTabs / PAGE_SIZE);

  const generateLink = (t: TabMetadata) => (
    <Link
      href={`/tab/${t.taburl}`}
      prefetch={false}
      title={t.timestamp}
      className="color-unset"
    >
      {t.song.artist} - {t.song.name}
      <span className="font-light text-xs">
        {" "}
        ({t.type}) (v{t.version})
      </span>
    </Link>
  );

  const tabList = (
    <>
      {allTabs.map((t, i) => (
        <li key={i}>{generateLink(t)}</li>
      ))}
    </>
  );

  const pageDropdrown = (
    <div>
      Page{" "}
      <select
        className="p-2 rounded-md"
        name="order"
        id="order"
        value={pageNum}
        onChange={(e) =>
          router.push(`/directory/${orderName}/${e.target.value}`)
        }
      >
        {Array.from(Array(pageCount).keys()).map((n) => (
          <option key={n + 1} value={n + 1}>
            {n + 1}
          </option>
        ))}
      </select>
      /{pageCount}
    </div>
  );

  return (
    <>
      <Head>
        <title>Song Directory</title>
      </Head>
      <div className="max-w-full w-[40rem] m-auto wrap">
        <div className="flex justify-between items-center gap-2 flex-wrap-reverse">
          <div>
            {totalSongs} songs, {totalTabs} tabs
          </div>
          <div className="flex gap-2 items-center justify-end">
            <select
              className="p-2 rounded-md"
              name="order"
              id="order"
              defaultValue={router.query.order}
              onChange={(e) => router.push(`/directory/${e.target.value}/1`)}
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
            {pageDropdrown}
          </div>
        </div>
        <hr className="m-2" />

        <div className="mx-8">
          <ol className="max-w-xl" start={(pageNum - 1) * PAGE_SIZE + 1}>
            {tabList}
          </ol>
          {pageDropdrown}
        </div>
      </div>
    </>
  );
}

const PAGE_SIZE = 100;

export async function getStaticPaths() {
  let tabCount = await prisma.tab.aggregate({
    _count: {
      taburl: true,
    },
  });

  const tabPages = Math.ceil(tabCount._count.taburl / PAGE_SIZE);

  const newPaths = Array.from(Array(tabPages).keys()).map((num) => ({
    params: { order: "new", page: num.toString() },
  }));
  const oldPaths = Array.from(Array(tabPages).keys()).map((num) => ({
    params: { order: "old", page: num.toString() },
  }));

  const paths = [...newPaths, ...oldPaths];

  return { paths, fallback: "blocking" };
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  let order = params?.order ?? "artist";
  let pagenum = +(params?.page ?? 1);

  let orderBy = [];

  orderBy = [
    {
      timestamp: order == "new" ? "desc" : "asc",
    },
  ];

  let [savedTabs, songCount, tabCount] = await Promise.all([
    prisma.tab.findMany({
      where: {
        tab: {
          not: "ALT",
        },
      },
      select: {
        taburl: true,
        type: true,
        version: true,
        timestamp: true,
        song: {
          select: {
            name: true,
            artist: true,
          },
        },
      },
      orderBy: orderBy as any,
      skip: (pagenum - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.song.aggregate({
      _count: true,
    }),
    prisma.tab.aggregate({
      _count: true,
    }),
  ]);

  return {
    props: {
      allTabs: savedTabs,
      totalSongs: songCount._count,
      totalTabs: tabCount._count,
    },
    revalidate: 60,
  };
};
