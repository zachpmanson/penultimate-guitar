import { SearchTabType } from "@/models/models";
import prisma from "../prisma";

function getSearchQuery(tabType: SearchTabType, includeArtist: boolean) {
  const heuristic = includeArtist
    ? `
    ps."name" ilike concat('%',$4,'%')
    and ps."artist" ilike concat('%',$6,'%')
  `
    : `
  (ps."name" ilike concat('%',$4,'%') or ps."artist" ilike concat('%',$4,'%'))
		and (length(ps."name") + length(ps."artist") + 4) >= length($1)
  `;

  const tabTypeFilter = tabType === "all" ? "" : `and ps."type" = '${tabType}'`;

  const wordSimilarityFilter = includeArtist
    ? `
    word_similarity(s."name", $1) > 0.5
    or word_similarity(s."artist", $5) > 0.5
  `
    : `
    word_similarity(s."name", $1) > 0.5
    OR word_similarity(s."artist", $1) > 0.5
  `;

  const similarityRank = includeArtist
    ? `
    similarity(s."name", $1) + similarity(s."artist", $5) AS sml3
  `
    : `
    similarity(s."name", $1) + similarity(s."artist", $1) AS sml3
  `;

  return `
-- stupid heuristic to cut the search space down. word_similarity is very expensive
with PrefixFiltered as (
	select * from public."PossibleSong" ps
	where
		${heuristic}
    ${tabTypeFilter}
),
CloseSongs as (
  select 
        s."name",
        s."artist",
        s."taburl",
        s."type"
  from PrefixFiltered s
  WHERE
        -- filter out anything where there is no word overlap
        ${wordSimilarityFilter}
)
SELECT 
  s."name",
  s."artist",
  array_agg(s."taburl") as taburl, 
  array_agg(ut."id") as tabId,
  array_agg(s."type") as type,
  ${similarityRank}
FROM CloseSongs s
left join public."Tab" ut on s."taburl" = ut."taburl"
-- TODO add a join to Song to get the real name and artist, prefer over the PossibleSong values
group by 
  (s."name", s."artist")
ORDER by
  sml3 DESC
LIMIT $2 OFFSET $3;
`;
}

export type SitemapSearchResult = {
  tabs: {
    type: "chords" | "tabs" | "ukulele" | "bass" | "drums" | "all";
    taburl: string;
    tabId: number | null;
  }[];
  name: string;
  artist: string;
};

export async function querySitemap(
  value: string,
  artist: string | undefined,
  tab_type: SearchTabType,
  cursor: number,
  page_size: number,
): Promise<{ items: SitemapSearchResult[]; nextCursor?: number }> {
  const strippedValue = value
    .toLowerCase()
    .replace(/[^0-9a-z ]/g, "")
    .replace(/ +/g, " ");
  console.log("Searching", strippedValue);
  const songRows: {
    name: string;
    artist: string;
    taburl: string[];
    tabid: (number | null)[];
    type: SearchTabType[];
    sml3: number;
  }[] = await prisma.$queryRawUnsafe(
    getSearchQuery(tab_type, !!artist),
    strippedValue,
    page_size,
    (cursor - 1) * page_size,
    strippedValue.slice(0, 4),
    artist ?? "",
    artist?.slice(0, 4) ?? "",
  );

  const a = songRows.map((t) => {
    let types = [];
    let hasTypes: Record<SearchTabType, boolean> = {
      chords: false,
      tabs: false,
      ukulele: false,
      bass: false,
      drums: false,
      all: false, // never used
    };
    for (let i = 0; i < t.taburl.length; i++) {
      // console.log(hasTypes);
      if (hasTypes[t.type[i]]) continue;

      types.push({
        type: t.type[i],
        taburl: t.taburl[i],
        tabId: t.tabid?.[i],
      });
      hasTypes[t.type[i]] = true;
    }
    let index = t.type.findIndex((t) => t === "chords");
    if (index === -1) index = t.type.findIndex((t) => t === "tabs");
    if (index === -1) index = 0;
    return {
      name: t.name,
      artist: t.artist,
      tabs: types,
    };
  });

  return {
    items: a,
    nextCursor: songRows.length >= page_size ? cursor + 1 : undefined,
  };
}
