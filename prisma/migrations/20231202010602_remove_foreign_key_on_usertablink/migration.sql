-- DropForeignKey
ALTER TABLE "UserTablink" DROP CONSTRAINT "UserTablink_taburl_fkey";

-- AlterTable
ALTER TABLE "UserTablink" ADD COLUMN     "tabId" TEXT;
