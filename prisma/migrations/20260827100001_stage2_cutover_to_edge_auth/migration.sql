-- STAGE 2 — cutover to edge auth. Deploy together with the new edge-auth code
-- and the Caddy Basic-auth change. After this the app is on the new identity:
-- username is the stable key and Spotify is an optional linked account.
--
-- This is the only maintenance moment, and it is transactional — if the
-- rejoin/orphan guard fires, the whole cutover rolls back.

-- 1) Reconcile anything the old app created during the interim since stage 1.
--    The old app writes Folder.spotifyUserId and User (spotify login) with no
--    username, so both get backfilled here before the constraints tighten.
DO $$
BEGIN
  -- Backfill interim folders (old app writes spotifyUserId, not userId).
  UPDATE "Folder" f SET "userId" = u."id"
  FROM "User" u
  WHERE u."spotifyUserId" = f."spotifyUserId" AND f."userId" IS NULL;

  -- Backfill interim users (a Spotify login during the interim creates a row
  -- with a spotifyUserId but no username).
  UPDATE "User" SET "username" = 'spotify:' || "spotifyUserId" WHERE "username" IS NULL;

  -- Guard: every folder must now map to a User row. Fail loudly rather than
  -- silently dropping or reparenting folders.
  IF EXISTS (
    SELECT 1 FROM "Folder" f
    LEFT JOIN "User" u ON u."id" = f."userId"
    WHERE u."id" IS NULL
  ) THEN
    RAISE EXCEPTION
      'Cutover aborted: some Folder."userId" values have no matching User.'
      ' Resolve orphaned folders before migrating (see stage-2 comment).';
  END IF;
END $$;

-- userId becomes required (matches the schema's non-null Folder.userId).
ALTER TABLE "Folder" ALTER COLUMN "userId" SET NOT NULL;

-- 2) Enforce username as the identity key now that edge sign-in is live.
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;

-- 3) Drop the old Folder plumbing; userId is canonical now.
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_spotifyUserId_fkey";
DROP INDEX "Folder_name_spotifyUserId_key";
ALTER TABLE "Folder" DROP COLUMN "spotifyUserId";

-- 4) Spotify becomes an optional linked account: spotifyUserId stays (it's the
--    link) but is no longer the identity, so it can be absent.
ALTER TABLE "User" ALTER COLUMN "spotifyUserId" DROP NOT NULL;
-- Drop the redundant non-unique index left over from the old @@index; the
-- unique key already covers lookups, and the datamodel no longer declares it.
DROP INDEX "User_spotifyUserId_idx";

-- 5) Post-condition (run manually for audit numbers):
--    SELECT (SELECT count(*) FROM "User") AS users,
--           (SELECT count(*) FROM "User" WHERE "username" LIKE 'spotify:%') AS unmapped,
--           (SELECT count(*) FROM "Folder") AS folders;
