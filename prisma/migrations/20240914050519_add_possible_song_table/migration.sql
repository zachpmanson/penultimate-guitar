-- DropIndex
DROP INDEX "trgm_song_artist_idx";

-- DropIndex
DROP INDEX "trgm_song_name_idx";

-- CreateTable
CREATE TABLE "PossibleSong" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "taburl" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PossibleSong_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PossibleSong_name_idx" ON "PossibleSong"("name");

-- CreateIndex
CREATE INDEX "PossibleSong_artist_idx" ON "PossibleSong"("artist");
