import PageDropdown from "@/components/directory/pagedropdown";
import { ROUTE_PREFIX } from "@/constants";
import { useGlobal } from "@/contexts/Global/context";
import prisma from "@/server/prisma";
import { useSearchStore } from "@/state/search";
import { tabCompareFn } from "@/utils/sort";
import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

type TabMetadata = {
  taburl: string;
  type: string;
  version: number;
  timestamp: string;
};

type SongMetadata = {
  id: number;
  name: string;
  artist: string;
  Tab: TabMetadata[];
};

export default function Directory({
  allSongs,
  totalSongs,
  totalTabs,
}: {
  allSongs: SongMetadata[];
  totalSongs: number;
  totalTabs: number;
}) {
  const router = useRouter();
  const { page } = router.query;
  const pageNum = +(page ?? 1);
  const { searchText, setSearchText } = useSearchStore();

  useEffect(() => {
    setSearchText("");
  }, [setSearchText]);

  if (searchText.length >= 3) {
    let lowerSearch = searchText.toLowerCase();
    allSongs = allSongs.filter(
      (song) =>
        song.name.toLowerCase().includes(lowerSearch) ||
        song.artist.toLowerCase().includes(lowerSearch)
    );
  }

  const pageCount = Math.ceil(totalSongs / PAGE_SIZE);

  const generateLink = (song: SongMetadata, index: number) => (
    <Link
      href={`${ROUTE_PREFIX.TAB}/${song.Tab[index].taburl}`}
      prefetch={false}
      title={song.Tab[index].timestamp}
      className="color-unset"
    >
      {song.artist} - {song.name}
      <span className="font-light text-xs">
        {" "}
        ({song.Tab[index].type}) (v{song.Tab[index].version})
      </span>
    </Link>
  );

  const tabList = (
    <>
      {allSongs.map((song, i) => (
        <li key={i}>
          {song.Tab.length === 1 ? (
            generateLink(song, 0)
          ) : (
            <details>
              <summary>
                {song.artist} - {song.name}{" "}
                <span className="font-light text-xs">
                  ({song.Tab.length} versions)
                </span>
              </summary>
              <ul className="pl-4">
                {song.Tab.sort(tabCompareFn).map((t, j) => (
                  <li key={j}>{generateLink(song, j)}</li>
                ))}
              </ul>
            </details>
          )}
        </li>
      ))}
    </>
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
            <PageDropdown
              pageNum={pageNum}
              pageCount={pageCount}
              order={"artist"}
            />
          </div>
        </div>
        <hr className="m-2 no-print dark:border-gray-600" />

        <div className="mx-8">
          <ol className="max-w-xl" start={(pageNum - 1) * PAGE_SIZE + 1}>
            {tabList}
          </ol>
          <div className="w-full flex justify-center">
            <PageDropdown
              pageNum={pageNum}
              pageCount={pageCount}
              order={"artist"}
              withButtons
            />
          </div>
        </div>
      </div>
    </>
  );
}

const PAGE_SIZE = 100;

export async function getStaticPaths() {
  // let songCount = await prisma.song.aggregate({
  //   _count: {
  //     id: true,
  //   },
  // });

  // const songPages = Math.ceil(songCount._count.id / PAGE_SIZE);

  // const artistPaths = Array.from(Array(songPages).keys()).map((num) => ({
  //   params: { order: "artist", page: (num + 1).toString() },
  // }));

  // const paths = [...artistPaths];

  return { paths: [], fallback: "blocking" };
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  let pagenum = +(params?.page ?? 1);

  let orderBy = [];
  orderBy = [
    {
      artist: "asc",
    },
    {
      name: "asc",
    },
  ];

  let [savedTabs, songCount, tabCount] = await Promise.all([
    prisma.song.findMany({
      include: {
        Tab: {
          where: {
            type: {
              not: "ALT", // Exclude tabs with type "ALT"
            },
          },
          select: {
            taburl: true,
            version: true,
            type: true,
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
      allSongs: savedTabs,
      totalSongs: songCount._count,
      totalTabs: tabCount._count,
    },
    revalidate: 60,
  };
};
