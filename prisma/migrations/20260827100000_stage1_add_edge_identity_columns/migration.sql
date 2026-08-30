-- STAGE 1 — additive backfill. Safe to deploy while the old Spotify/next-auth
-- flow is fully live: NOTHING is dropped, so the existing app keeps working
-- byte-for-byte. The new columns are created and populated so the data move
-- can be inspected (and corrected) BEFORE anything is required of it in stage 2.
--
-- Deployable any time. Ordering note: all data movement (the username and
-- folder backfills) runs BEFORE any CREATE INDEX, so the file is robust across
-- migration engines (avoids psql 17's prepared-plan quirk where a CREATE INDEX
-- on a table referenced by a later UPDATE...FROM can make that update match
-- zero rows in the same script).

-- 1) New User.username — nullable for now, so the old app is unaffected and an
--    existing row can temporarily coexist with the new identity column.
ALTER TABLE "User" ADD COLUMN "username" TEXT;

-- 2) Spotify refresh token (nullable) so the server can act as the user; the
--    same column the Connect-Spotify flow will write going forward.
ALTER TABLE "User" ADD COLUMN "spotifyRefreshToken" TEXT;

-- 3) New Folder.userId, populated from the owner's User.id while the OLD
--    Folder.spotifyUserId column, its FK and its unique index all stay in
--    place. That keeps the old app's writes during the interim working and
--    still owned by the (old) spotify id.
ALTER TABLE "Folder" ADD COLUMN "userId" TEXT;

-- ---------------------------------------------------------------------
-- USERNAME MAPPING (author: fill in before deploying to prod)
-- ---------------------------------------------------------------------
-- The new identity is the htpasswd username Caddy stamps as `x-auth-user`.
-- Existing User rows were created by the old Spotify-only flow and have no
-- username yet. Paste one UPDATE per real user, mapping their OLD
-- spotifyUserId (the linked Spotify login) to the REAL username they'll sign
-- in with:
--
--   UPDATE "User" SET "username" = 'zach' WHERE "spotifyUserId" = '12abc34xy';
--   UPDATE "User" SET "username" = 'zoe'  WHERE "spotifyUserId" = '9fedcba09';
--
-- Unmapped users are NOT lost — they get a deterministic `spotify:<id>`
-- fallback right below so their data survives either way. Eyeball the result
-- with the INSPECTION query at the bottom before cutover.
-- =====================================================================
-- (mapping UPDATEs go here, one per line)

-- Fallback: deterministic username for any unmapped user, so no data is lost.
UPDATE "User" SET "username" = 'spotify:' || "spotifyUserId" WHERE "username" IS NULL;

-- Rekey folders to their owner's User.id (old spotify id -> new cuid).
UPDATE "Folder" f SET "userId" = u."id" FROM "User" u WHERE u."spotifyUserId" = f."spotifyUserId";

-- 4) Constrain the new folder column and index the new identity (all after the
--    data movement above).
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Unique username, ready to enforce the new identity at cutover (nullable now,
-- so interim writes with no username don't collide).
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
-- Matches the schema's @@index([username]).
CREATE INDEX "User_username_idx" ON "User"("username");
-- Unique from here (covers the backfilled rows); any folders the old app
-- creates during the interim have NULL userId and are re-joined in stage 2.
CREATE UNIQUE INDEX "Folder_name_userId_key" ON "Folder"("name", "userId");

-- ---------------------------------------------------------------------
-- INSPECTION (run between stage 1 and stage 2 to eyeball the move):
--   SELECT u."spotifyUserId", u."username",
--          f."spotifyUserId" AS old_folder_owner, f."userId" AS new_folder_owner
--   FROM "User" u JOIN "Folder" f ON f."spotifyUserId" = u."spotifyUserId";
-- Confirms every old owner attaches to the right new user row before the new
-- identity is required. Also: SELECT "username" FROM "User" WHERE "username"
-- LIKE 'spotify:%' to see who needs an explicit mapping.
-- ---------------------------------------------------------------------
