/*
  Warnings:

  - You are about to drop the column `confirmed` on the `PossibleSong` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PossibleSong" DROP COLUMN "confirmed",
ADD COLUMN     "songId" INTEGER;

-- AddForeignKey
ALTER TABLE "PossibleSong" ADD CONSTRAINT "PossibleSong_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX trgm_possiblesong_name_idx ON "PossibleSong" USING GIN (name gin_trgm_ops);
CREATE INDEX trgm_possiblesong_artist_idx ON "PossibleSong" USING GIN (artist gin_trgm_ops);