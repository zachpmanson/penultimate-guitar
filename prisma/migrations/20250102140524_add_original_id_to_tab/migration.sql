/*
Warnings:

- Added the required column `originalId` to the `Tab` table without a default value. This is not possible if the table is not empty.

*/
-- Create a function to extract the originalId from taburl
CREATE
OR REPLACE FUNCTION extract_original_id () RETURNS TRIGGER AS $$
BEGIN
    -- Extract the last segment of the taburl split by '-'
    NEW."originalId" = COALESCE(
        CAST(split_part(NEW."taburl", '-', array_length(string_to_array(NEW."taburl", '-'), 1)) AS INTEGER), 
        0
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the originalId column when a row is inserted or updated
CREATE TRIGGER update_original_id BEFORE INSERT
OR
UPDATE ON "Tab" FOR EACH ROW WHEN (NEW."taburl" IS NOT NULL)
EXECUTE FUNCTION extract_original_id ();

-- AlterTable
ALTER TABLE "Tab"
ADD COLUMN "originalId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Tab_originalId_idx" ON "Tab" ("originalId");
