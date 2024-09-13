-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE INDEX trgm_song_name_idx ON "Song" USING GIN (name gin_trgm_ops);
CREATE INDEX trgm_song_artist_idx ON "Song" USING GIN (artist gin_trgm_ops);