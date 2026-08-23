# AGENTS.md

Pen Ultimate Guitar — an alternate frontend for Ultimate Guitar, built with
Next.js (pages router, Next 16), tRPC, Prisma, next-auth (Spotify), React 18,
pnpm, Tailwind v4.

## Working in this repo

- Trunk is `main` — branch from it, PR into it.
- Devshell: `nix develop` (nodejs_22, pnpm, prisma-engines_6, engine env vars
  set). Shortcuts via Makefile: `make dev`, `make build`, `make typecheck`,
  `make format`, `make clean`.
- `pnpm install --frozen-lockfile` then `pnpm dev --turbo` for local dev.
- Prisma schema is `prisma/schema.prisma`; migrations via `pnpm migrate`.
- The app talks to the Ultimate Guitar API + Spotify on the server side;
  tRPC router in `src/server/routers/`.

## Deploy / hosting

- Runs on naboo as a NixOS service: zpm/nix flake input
  `penultimate-guitar` → `services.penultimate-guitar` (port 3000, env file
  `/etc/penultimate-guitar.env`, requires DATABASE_URL, NEXTAUTH_SECRET,
  NEXTAUTH_URL, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET).
- Served at `pg.zachmanson.com` behind caddy (`reverse_proxy localhost:3000`).
- Fleet deploy: `deploy-service penultimate-guitar` (bumps the flake input to
  latest `main` and restarts). The Nix build is `nix/package.nix` — a
  standalone Next output with the ISR prerender cache relocated to
  `/var/lib/penultimate-guitar` (see `cache-handlers/writable.js`).

## Staging

A sub-route staging instance (PR previews) can be mounted at
`pg.zachmanson.com/staging`. It runs a second build of the app compiled with
`basePath="/staging"`, on its own port, own env file, own ISR cache dir.

- **App-side support (in `main`):** build-time `NEXT_PUBLIC_BASE_PATH` is
  threaded through `next.config.js` (sets `basePath` when non-empty),
  `nix/package.nix` (exports the env at build), and `src/utils/basePath.ts`
  (client-inlined constant). Any root-relative client URL must go through it:
  tRPC `getBaseUrl()` (`src/utils/trpc.ts`), the chords fetch
  (`src/contexts/Global/index.tsx`), icons/favicon (`_app.tsx`,
  `IconGuitar.tsx`). With the env unset the build is identical to prod.
- **Infra (zpm/nix):** a `penultimate-guitar-staging` flake input pinned to a
  branch, a host-side module defining the `penultimate-guitar-staging` unit
  (port 3010, env `/etc/penultimate-guitar.staging.env`), and a caddy
  `/staging /staging/*` route ahead of the prod proxy in the pg vhost.
- **Status: DISABLED** (2026-08-23, after PR #167 merged to main). The staging
  input/module/route were removed from zpm/nix; the branch it pinned to is
  retained in this repo.
- **To re-enable:** re-add the flake input (pin to the branch you want to
  preview), re-add the module + host config + caddy route in zpm/nix, create
  `/etc/penultimate-guitar.staging.env` (same keys as prod), then deploy.
  ⚠️ `deploy-service nix` does NOT bump flake inputs — after changing the
  branch a pinned input points at, run `nix flake lock --update-input
  penultimate-guitar-staging` in zpm/nix and push before deploying.
