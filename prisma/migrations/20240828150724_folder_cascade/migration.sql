-- DropForeignKey
ALTER TABLE "UserTablink" DROP CONSTRAINT "UserTablink_folderId_fkey";

-- AddForeignKey
ALTER TABLE "UserTablink" ADD CONSTRAINT "UserTablink_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
