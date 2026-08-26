-- Decouple account identity from Spotify: the edge-authenticated username
-- (Basic auth, stamped by Caddy as X-Auth-User) becomes the stable identity
-- key on `User`; Spotify becomes an ordinary optional linked account instead of
-- the identity itself (whose uniqueness was capping who could log in via the
-- Spotify dev-mode account limit).
--
-- Folders / saved tabs are rekeyed off `User.id` rather than `spotifyUserId`,
-- so a user's saved tabs survive a Spotify disconnection.
--
-- Authoring note (fleet slippy): generated against the schema state produced
-- by replaying the prior migrations (`prisma migrate deploy` on a fresh DB);
-- applied in staging, never against prod.

-- 1) Make User.username the stable identity key (new column).
ALTER TABLE "User" ADD COLUMN "username" TEXT;
-- Existing rows (created by the old Spotify-only flow) get a deterministic
-- username derived from their Spotify id so their data is preserved. On a
-- fresh staging DB there are no User rows yet, so this is a no-op.
UPDATE "User" SET "username" = 'spotify:' || "spotifyUserId";
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
-- Matches the schema's @@index([username]).
CREATE INDEX "User_username_idx" ON "User"("username");

-- 2) Spotify becomes an optional linked account: allow a missing spotifyUserId
--    (the existing "User_spotifyUserId_key" unique index stays), and persist a
--    refresh token so the server can act on the user's behalf.
ALTER TABLE "User" ALTER COLUMN "spotifyUserId" DROP NOT NULL;
ALTER TABLE "User" ADD COLUMN "spotifyRefreshToken" TEXT;
-- The old schema had a redundant non-unique index on spotifyUserId (from a
-- now-removed @@index); the unique key already covers lookups, so drop it to
-- keep the deployed schema in sync with the datamodel.
DROP INDEX "User_spotifyUserId_idx";

-- 3) Rekey Folder from spotifyUserId to the owning User row.
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_spotifyUserId_fkey";
DROP INDEX "Folder_name_spotifyUserId_key";
ALTER TABLE "Folder" RENAME COLUMN "spotifyUserId" TO "userId";
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_name_userId_key" UNIQUE ("name", "userId");