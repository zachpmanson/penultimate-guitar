{ pkgs ? import <nixpkgs> {} }:

let
  pnpmDeps = pkgs.pnpm.fetchDeps {
    pname = "penultimate-guitar";
    version = "0.1.0";
    src = ../.;
    hash = pkgs.lib.fakeHash;  # run `nix build`, paste the correct hash from the error
  };
in

pkgs.stdenv.mkDerivation {
  pname = "penultimate-guitar";
  version = "0.1.0";
  src = ../.;

  nativeBuildInputs = [ pkgs.nodejs_24 pkgs.pnpm pkgs.prisma-engines ];

  inherit pnpmDeps;
  inherit (pkgs.pnpm) configHook;

  PRISMA_QUERY_ENGINE_LIBRARY = "${pkgs.prisma-engines}/lib/libquery_engine.node";
  PRISMA_SCHEMA_ENGINE_BINARY  = "${pkgs.prisma-engines}/bin/schema-engine";
  PRISMA_FMT_BINARY            = "${pkgs.prisma-engines}/bin/prisma-fmt";
  # Avoids prisma generate crash at build time; no connection is made
  DATABASE_URL = "postgresql://localhost/dummy";

  buildPhase = ''
    pnpm install --offline --ignore-scripts
    pnpm prisma generate
    pnpm next build
  '';

  # Prisma's .node engine binary is not traced by Next.js NFT — copy it manually
  postBuild = ''
    dest=.next/standalone/node_modules/.prisma/client
    mkdir -p "$dest"
    cp ${pkgs.prisma-engines}/lib/libquery_engine.node \
       "$dest/libquery_engine-linux-musl-openssl-3.0.x.node"
  '';

  installPhase = ''
    mkdir -p $out
    cp -r .next/standalone/. $out/
    cp -r .next/static $out/.next/static
    cp -r public $out/public
  '';
}
