/*
  Warnings:

  - You are about to drop the column `spotifyUserId` on the `UserTablink` table. All the data in the column will be lost.
  - Made the column `folderId` on table `UserTablink` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "UserTablink" DROP CONSTRAINT "UserTablink_folderId_fkey";

-- DropForeignKey
ALTER TABLE "UserTablink" DROP CONSTRAINT "UserTablink_spotifyUserId_fkey";

-- AlterTable
ALTER TABLE "UserTablink" DROP COLUMN "spotifyUserId",
ALTER COLUMN "folderId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "UserTablink" ADD CONSTRAINT "UserTablink_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
