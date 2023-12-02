/*
  Warnings:

  - You are about to drop the column `tablink` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "tablink";

-- CreateTable
CREATE TABLE "UserTablink" (
    "id" TEXT NOT NULL,
    "spotifyUserId" TEXT NOT NULL,
    "taburl" TEXT NOT NULL,
    "folder" TEXT NOT NULL,

    CONSTRAINT "UserTablink_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserTablink" ADD CONSTRAINT "UserTablink_taburl_fkey" FOREIGN KEY ("taburl") REFERENCES "Tab"("taburl") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTablink" ADD CONSTRAINT "UserTablink_spotifyUserId_fkey" FOREIGN KEY ("spotifyUserId") REFERENCES "User"("spotifyUserId") ON DELETE RESTRICT ON UPDATE CASCADE;
