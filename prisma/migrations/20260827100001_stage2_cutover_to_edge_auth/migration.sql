-- STAGE 2 — cutover to edge auth. Deploy together with the new edge-auth code
-- and the Caddy Basic-auth change. After this the app is on the new identity:
-- username is the stable key and Spotify is an optional linked account.
--
-- Decision (Zach, 2026-09-01): unmapped accounts are NOT preserved. Anyone who
-- wasn't given a real username in stage 1's MAPPING block — i.e. every
-- fallback 'spotify:<id>' row — is deleted here, along with their folders and
-- saved tabs (via the new Folder FK cascade). Only the mapped users (zach,
-- john) survive the cutover. Anyone else who wants an account gets a fresh one
-- under their own htpasswd username after the switch.
--
-- This is the only maintenance moment, and it is transactional — if the
-- purge/orphan guard fires, the whole cutover rolls back.

-- 1) Reconcile anything the old app created during the interim since stage 1.
--    The old app writes Folder.spotifyUserId and User (spotify login) with no
--    username, so both get backfilled before the constraints tighten.
DO $$
BEGIN
  -- a) Backfill interim folders (old app writes spotifyUserId, not userId).
  --    Runs FIRST so real users' interim folders attach to their User.id and
  --    survive the unmapped-account purge below.
  UPDATE "Folder" f SET "userId" = u."id"
  FROM "User" u
  WHERE u."spotifyUserId" = f."spotifyUserId" AND f."userId" IS NULL;

  -- b) Backfill interim users (a Spotify login during the interim creates a
  --    row with a spotifyUserId but no username). They take the deterministic
  --    fallback — and are then covered by the purge in step 2.
  UPDATE "User" SET "username" = 'spotify:' || "spotifyUserId" WHERE "username" IS NULL;
END $$;

-- 2) Purge unmapped accounts. The OLD Folder.spotifyUserId FK (ON DELETE
--    RESTRICT) is dropped first: after the rejoin above, folders live on
--    User.id and the old reference would block the user deletes. Then every
--    synthetic 'spotify:<id>' username is deleted; FK Folder_userId_fkey
--    (stage 1) cascades to their folders, and those cascade to their saved
--    tabs. Mapped users (zach, john) have real usernames and are untouched.
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_spotifyUserId_fkey";

DELETE FROM "User" WHERE "username" LIKE 'spotify:%';

-- Guard: every remaining folder must map to a User row. Fail loudly rather
-- than silently dropping or reparenting folders.
DO $$
BEGIN
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

-- 3) Enforce username as the identity key now that edge sign-in is live.
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;

-- 4) Drop the old Folder plumbing; userId is canonical now.
DROP INDEX "Folder_name_spotifyUserId_key";
ALTER TABLE "Folder" DROP COLUMN "spotifyUserId";

-- 5) Spotify becomes an optional linked account: spotifyUserId stays (it's the
--    link) but is no longer the identity, so it can be absent.
ALTER TABLE "User" ALTER COLUMN "spotifyUserId" DROP NOT NULL;
-- Drop the redundant non-unique index left over from the old @@index; the
-- unique key already covers lookups, and the datamodel no longer declares it.
DROP INDEX "User_spotifyUserId_idx";

-- 6) Post-condition (run manually for audit numbers):
--    SELECT (SELECT count(*) FROM "User") AS users,
--           (SELECT count(*) FROM "User" WHERE "username" LIKE 'spotify:%') AS leftover_unmapped,
--           (SELECT count(*) FROM "Folder") AS folders;