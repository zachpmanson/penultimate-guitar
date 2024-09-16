CREATE TEMPORARY TABLE temp_possible_songs AS
    SELECT * FROM public."PossibleSong"
WITH NO DATA;

--\copy temp_possible_songs (name,artist,taburl,type) FROM '/Users/zach/Documents/penultimate-guitar/science/sitemap/autorefresh/tab-urls.csv' DELIMITER ',' csv header;
\copy temp_possible_songs (name,artist,taburl,type) FROM '/root/penultimate-guitar/science/sitemap/autorefresh/tab-urls.csv' DELIMITER ',' csv header;

INSERT INTO public."PossibleSong" (name,artist,taburl,type)
    SELECT name,artist,taburl,type FROM temp_possible_songs
ON CONFLICT DO NOTHING;
