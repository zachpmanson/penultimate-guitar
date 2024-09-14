/*
  Warnings:

  - A unique constraint covering the columns `[taburl]` on the table `PossibleSong` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "trgm_possiblesong_artist_idx";

-- DropIndex
DROP INDEX "trgm_possiblesong_name_idx";

-- CreateIndex
CREATE UNIQUE INDEX "PossibleSong_taburl_key" ON "PossibleSong"("taburl");

-- CreateIndex
CREATE INDEX "PossibleSong_taburl_idx" ON "PossibleSong"("taburl");
