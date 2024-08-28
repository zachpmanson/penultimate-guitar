/*
  Warnings:

  - Added the required column `folderName` to the `UserTablink` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
CREATE SEQUENCE song_id_seq;
ALTER TABLE "Song" ALTER COLUMN "id" SET DEFAULT nextval('song_id_seq');
ALTER SEQUENCE song_id_seq OWNED BY "Song"."id";

-- AlterTable
-- ALTER TABLE "UserTablink" ADD COLUMN     "folderName" TEXT NOT NULL; -- auto generated
ALTER TABLE "UserTablink" RENAME COLUMN "folder" TO "folderName";
