-- Decouple account identity from Spotify: the edge-authenticated username
-- (Basic auth, stamped by Caddy as X-Auth-User) becomes the stable identity
-- key on `User`; Spotify becomes an ordinary optional linked account instead of
-- the identity itself (whose uniqueness was capping who could log in via the
-- Spotify dev-mode account limit).
--
-- Folders / saved tabs are rekeyed off `User.id` rather than `spotifyUserId`,
-- so a user's saved tabs survive a Spotify disconnection.
--
-- Authoring note (fleet slippy): this is a DATA migration, not just a schema
-- one. It preserves existing users' folders/saved tabs when run against a DB
-- that already has rows (prod). Steps that were only safe on an empty staging
-- DB — the Folder rekey and the username backfill — now carry a real data path:
--   1. each existing spotify user gets a real username via the MAPPING block
--      below (author: paste the spotify-id -> htpasswd-username pairs in),
--   2. folders are joined to their owner's new `User.id` (not blindly rekeyed),
--   3. an orphan guard fails loudly rather than silently dropping folders.

-- =====================================================================
-- 1) Make User.username the stable identity key (new column).
ALTER TABLE "User" ADD COLUMN "username" TEXT;
-- ---------------------------------------------------------------------
-- USERNAME MAPPING (author: fill this in before deploying to prod)
-- ---------------------------------------------------------------------
-- The app looks users up by the htpasswd username Caddy stamps as
-- `x-auth-user`. Existing rows were created by the old Spotify-only flow, so
-- there is no username on them yet. Paste one UPDATE per existing user,
-- mapping their OLD spotifyUserId (the linked Spotify login) to the REAL
-- htpasswd username they will sign in with:
--
--   UPDATE "User" SET "username" = 'zach'   WHERE "spotifyUserId" = '12abc34xy';
--   UPDATE "User" SET "username" = 'zoe'    WHERE "spotifyUserId" = '9fedcba09';
--
-- These run AFTER the column exists (this is the right spot). Users omitted
-- here are NOT lost — they fall back to a deterministic `spotify:<id>`
-- username right below so all their rows survive. If you realise later that a
-- `spotify:` row should be a real user, adopt it with a follow-up UPDATE
-- *before anyone signs in under that name* (see note at the bottom).
-- =====================================================================
-- (mapping UPDATEs go here, one per line)

-- Fallback for any user without a mapping: deterministic `spotify:` username
-- so their data is preserved either way. On a fresh DB there are no User rows,
-- so this is a no-op.
UPDATE "User" SET "username" = 'spotify:' || "spotifyUserId" WHERE "username" IS NULL;
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

-- 3a) Orphan guard: every folder must still map to a User. On healthy data the
--     old FK already guaranteed this, but fail loudly rather than silently
--     dropping or orphaning folders if legacy rows slip through (deleted
--     Spotify users etc.).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "Folder" f
    LEFT JOIN "User" u ON u."spotifyUserId" = f."userId"
    WHERE u."id" IS NULL
  ) THEN
    RAISE EXCEPTION
      'Folder rekey aborted: some Folder."userId" values have no matching User."spotifyUserId". '
      'Resolve these before migrating (see migration comment, orphan guard).';
  END IF;
END $$;

-- 3b) The renamed column currently still holds the *Spotify* id. Rewrite it to
--     the owning User row's cuid (User.id) so the FK below is satisfiable.
--     This is the part the old migration skipped, and exactly what breaks on a
--     populated DB.
UPDATE "Folder" f SET "userId" = u."id"
FROM "User" u
WHERE u."spotifyUserId" = f."userId";

ALTER TABLE "Folder" ADD CONSTRAINT "Folder_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_name_userId_key" UNIQUE ("name", "userId");

-- 4) Post-condition report (run manually if you want audit numbers):
--    SELECT (SELECT count(*) FROM "User")          AS users,
--           (SELECT count(*) FROM "User" WHERE "username" LIKE 'spotify:%') AS unmapped,
--           (SELECT count(*) FROM "Folder" f JOIN "User" u ON u."id" = f."userId" WHERE u."spotifyUserId" IS NULL) AS folders_lost;
--
-- Note on late adoptions: if someone signs in under the new style BEFORE their
-- `spotify:` row is renamed, the app's getOrCreateAccountByUsername creates a
-- SECOND User row under their real name (spotifyUserId still NULL), and renaming
-- the old row afterwards collides on the unique username index — so rename any
-- `spotify:` rows BEFORE first sign-in, or merge/copy data instead.
