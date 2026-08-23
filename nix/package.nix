{ pkgs ? import <nixpkgs> {}, rev ? null, buildTime ? null, basePath ? "" }:

let
  pnpmDeps = pkgs.fetchPnpmDeps {
    pname = "penultimate-guitar";
    version = "0.1.0";
    src = ../.;
    fetcherVersion = 3;
    hash = "sha256-jhXcI6UNsY9tyOfO6LdezcOMewpUpy0d5hyTwv2CL5U=";
  };
in

pkgs.stdenv.mkDerivation {
  pname = "penultimate-guitar";
  version = "0.1.0";
  src = ../.;

  nativeBuildInputs = [ pkgs.nodejs_22 pkgs.pnpm pkgs.pnpmConfigHook pkgs.prisma-engines_6 ];

  inherit pnpmDeps;

  PRISMA_QUERY_ENGINE_LIBRARY = "${pkgs.prisma-engines_6}/lib/libquery_engine.node";
  PRISMA_SCHEMA_ENGINE_BINARY  = "${pkgs.prisma-engines_6}/bin/schema-engine";
  PRISMA_FMT_BINARY            = "${pkgs.prisma-engines_6}/bin/prisma-fmt";
  # Avoids prisma generate crash at build time; no connection is made
  DATABASE_URL = "postgresql://localhost/dummy";

  buildPhase = ''
    export NEXT_PUBLIC_BUILD_REV="${if rev != null then rev else ""}"
    export NEXT_PUBLIC_BUILD_TIME="${if buildTime != null then buildTime else ""}"
    export NEXT_PUBLIC_BASE_PATH="${basePath}"
    pnpm install --offline --frozen-lockfile
    pnpm prisma generate
    pnpm next build
  '';


  # Prisma's .node engine binary is not traced by Next.js NFT — copy it manually
  postBuild = ''
    dest=.next/standalone/node_modules/.prisma/client
    mkdir -p "$dest"
    cp ${pkgs.prisma-engines_6}/lib/libquery_engine.node \
       "$dest/libquery_engine-linux-musl-openssl-3.0.x.node"

    # Bundle the custom ISR cache handler into the standalone runtime. Next
    # resolves cacheHandler relative to distDir (./.next -> ../cache-handlers),
    # so it lives at the standalone root next to .next.
    mkdir -p .next/standalone/cache-handlers
    cp cache-handlers/writable.js .next/standalone/cache-handlers/writable.js
  '';

  installPhase = ''
    find .next/standalone -xtype l -delete
    mkdir -p $out
    cp -r .next/standalone/. $out/
    cp -r .next/static $out/.next/static
    cp -r public $out/public
  '';
}