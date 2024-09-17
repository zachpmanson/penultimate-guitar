import prisma from "./prisma";
import { SearchTabType } from "./routers/tab";

function getSearchQuery(tabType: SearchTabType) {
  if (tabType === "all") {
    return `
-- stupid heuristic to cut the search space down. word_similarity is very expensive
with PrefixFiltered as (
	select * from public."PossibleSong" ps
	where
		(ps."name" ilike concat('%',$4,'%') or ps."artist" ilike concat('%',$4,'%'))
		and (length(ps."name") + length(ps."artist") + 1) >= length($1)
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
        word_similarity(s."name", $1) > 0.5
        OR word_similarity(s."artist", $1) > 0.5
)
SELECT 
  s."name",
  s."artist",
  array_agg(s."taburl") as taburl, 
  array_agg(ut."id") as tabId,
  array_agg(s."type") as type,
  similarity(s."name", $1) + similarity(s."artist", $1) AS sml3
FROM CloseSongs s
left join public."Tab" ut on s."taburl" = ut."taburl"
-- TODO add a join to Song to get the real name and artist, prefer over the PossibleSong values
group by 
  (s."name", s."artist")
ORDER by
  sml3 DESC
LIMIT $2 OFFSET $3;
`;
  } else {
    return `
with PrefixFiltered as (
	select * from public."PossibleSong" ps where 
		(ps."name" ilike concat('%',$4,'%') or ps."artist" ilike concat('%',$4,'%'))
		and (length(ps."name") + length(ps."artist") + 1) >= length($1)
    and ps."type" = '${tabType}'
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
        word_similarity(s."name", $1) > 0.5
        OR word_similarity(s."artist", $1) > 0.5
)
SELECT 
  s."name",
  s."artist",
  array_agg(s."taburl") as taburl, 
  array_agg(ut."id") as tabId,
  array_agg(s."type") as type,
  similarity(s."name", $1) + similarity(s."artist", $1) AS sml3
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
}

export async function querySitemap(
  value: string,
  tab_type: SearchTabType,
  cursor: number,
  page_size: number
) {
  const strippedValue = value.replace(/[^0-9a-z ]/g, "");

  const songRows: {
    name: string;
    artist: string;
    taburl: string[];
    tabid: number[];
    type: SearchTabType[];
    sml3: number;
  }[] = await prisma.$queryRawUnsafe(
    getSearchQuery(tab_type),
    strippedValue,
    page_size,
    (cursor - 1) * page_size,
    strippedValue.slice(0, 4)
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
      if (hasTypes[t.type[i]]) continue;

      types.push({
        type: t.type[i],
        taburl: t.taburl[i],
        tabId: t.tabid?.[i],
      });
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
