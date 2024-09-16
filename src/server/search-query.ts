import { SearchTabType } from "./routers/tab";

export function getSearchQuery(tabType: SearchTabType) {
  if (tabType === "all") {
    return `
-- stupid heuristic to cut the search space down. word_similarity is very expensive
with PrefixFiltered as (
	select * from public."PossibleSong" ps where ps."name" ilike concat('%',$4,'%') OR  ps."artist" ilike concat('%',$4,'%')
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
  (ps."name" ilike concat('%',$4,'%') OR  ps."artist" ilike concat('%',$4,'%'))
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
