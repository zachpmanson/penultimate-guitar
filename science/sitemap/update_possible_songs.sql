CREATE TEMPORARY TABLE temp_possible_songs AS
    SELECT * FROM public."PossibleSong"
WITH NO DATA;

\copy temp_possible_songs (name,artist,taburl,type,"originalId") FROM '/Users/zach/Documents/penultimate-guitar/science/sitemap/autorefresh/tab-urls-with-id.csv' DELIMITER ',' csv header;
-- \copy temp_possible_songs (name,artist,taburl,type) FROM '/root/penultimate-guitar/science/sitemap/autorefresh/tab-urls.csv' DELIMITER ',' csv header;

INSERT INTO public."PossibleSong" (name,artist,taburl,type,"originalId")
    SELECT name,artist,taburl,type,"originalId" FROM temp_possible_songs
ON CONFLICT DO NOTHING;
