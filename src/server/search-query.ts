import { SearchTabType } from "./routers/tab";

export function getSearchQuery(tabType: SearchTabType) {
  if (tabType === "all") {
    return `
            with CloseSongs as (
              select 
                    s."name",
                    s."artist",
                    s."taburl",
                    s."type",
                    -- get similarity based on whole search term
                    --similarity(s."name", $1) AS sml1, 
                    --similarity(s."artist", $1) AS sml2,
                    --word_similarity(s."name", $1) AS w_sml1,
                    --word_similarity(s."artist", $1) AS w_sml2,
                    -- merge similarity to rank on
                    similarity(s."name", $1) + similarity(s."artist", $1) AS sml3
              from public."PossibleSong" s
              WHERE
                    -- filter out anything where there is no word overlap
                    word_similarity(s."name", $1) > 0.3
                    OR word_similarity(s."artist", $1) > 0.3
            )
    
            SELECT 
              s."name",
              s."artist",
              array_agg(s."taburl") as taburl, 
              array_agg(ut."id") as tabId,
              array_agg(s."type") as type,
              -- get similarity based on whole search term
              similarity(s."name", $1) AS sml1, 
              similarity(s."artist", $1) AS sml2,
              word_similarity(s."name", $1) AS w_sml1,
              word_similarity(s."artist", $1) AS w_sml2,
              -- merge similarity to rank on
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
            with CloseSongs as (
              select 
                    s."name",
                    s."artist",
                    s."taburl",
                    s."type",
                    -- get similarity based on whole search term
                    --similarity(s."name", $1) AS sml1, 
                    --similarity(s."artist", $1) AS sml2,
                    --word_similarity(s."name", $1) AS w_sml1,
                    --word_similarity(s."artist", $1) AS w_sml2,
                    -- merge similarity to rank on
                    similarity(s."name", $1) + similarity(s."artist", $1) AS sml3
              from public."PossibleSong" s
              WHERE
                    -- filter out anything where there is no word overlap
                    s."type" = '${tabType}'
                    AND (word_similarity(s."name", $1) > 0.3 OR word_similarity(s."artist", $1) > 0.3)
                    
            )
    
            SELECT 
              s."name",
              s."artist",
              array_agg(s."taburl") as taburl, 
              array_agg(ut."id") as tabId,
              array_agg(s."type") as type,
              -- get similarity based on whole search term
              similarity(s."name", $1) AS sml1, 
              similarity(s."artist", $1) AS sml2,
              word_similarity(s."name", $1) AS w_sml1,
              word_similarity(s."artist", $1) AS w_sml2,
              -- merge similarity to rank on
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
