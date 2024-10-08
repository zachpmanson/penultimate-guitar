/*
  Warnings:

  - A unique constraint covering the columns `[taburl,folderId]` on the table `UserTablink` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "UserTablink" ADD COLUMN     "folderId" INTEGER;

-- CreateTable
CREATE TABLE "Folder" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "spotifyUserId" TEXT NOT NULL,
    "playlistUrl" TEXT,
    "imageUrl" TEXT,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Folder_name_spotifyUserId_key" ON "Folder"("name", "spotifyUserId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTablink_taburl_folderId_key" ON "UserTablink"("taburl", "folderId");

-- AddForeignKey
ALTER TABLE "UserTablink" ADD CONSTRAINT "UserTablink_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_spotifyUserId_fkey" FOREIGN KEY ("spotifyUserId") REFERENCES "User"("spotifyUserId") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "Folder" ("name", "spotifyUserId")
SELECT DISTINCT "UserTablink"."folderName", "UserTablink"."spotifyUserId"
FROM "UserTablink";

update "UserTablink" 
set "folderId" = "Folder"."id" 
from "Folder" inner join "UserTablink" utl on "Folder"."spotifyUserId" = utl."spotifyUserId" and "Folder"."name" = utl."folderName"
where "Folder"."spotifyUserId" = "UserTablink"."spotifyUserId"  and "UserTablink"."folderName" = "Folder"."name";

