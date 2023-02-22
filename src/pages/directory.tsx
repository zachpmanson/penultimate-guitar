import prisma from "@/lib/prisma";
import { TabDto } from "@/models";
import Head from "next/head";
import Link from "next/link";

type ListProps = {
  allTabs: TabDto[];
};

export default function Directory({ allTabs }: ListProps) {
  return (
    <>
      <Head>
        <title>Song Directory</title>
      </Head>
      <div className="w-fit m-auto wrap">
        <div>
          <ol>
            {allTabs.map((t, i) => (
              <li key={i}>
                <Link href={`/tab/${t.taburl}`}>
                  {t.artist} - {t.name}
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
  const allTabs = await prisma.tab.findMany({
    orderBy: {
      artist: "asc",
    },
  });

  return {
    props: { allTabs: allTabs },
  };
}
