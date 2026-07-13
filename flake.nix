{
  description = "penultimate-guitar";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = nixpkgs.legacyPackages.${system};
      in {
        packages.default = pkgs.callPackage ./nix/package.nix {};

        devShells.default = pkgs.mkShell {
          packages = [ pkgs.nodejs_22 pkgs.pnpm pkgs.prisma-engines_6 ];

          # Point pnpm/prisma at the nix-provided engine binaries (matches
          # nix/package.nix) so `pnpm prisma generate` works in the shell.
          PRISMA_QUERY_ENGINE_LIBRARY = "${pkgs.prisma-engines_6}/lib/libquery_engine.node";
          PRISMA_SCHEMA_ENGINE_BINARY = "${pkgs.prisma-engines_6}/bin/schema-engine";
          PRISMA_FMT_BINARY = "${pkgs.prisma-engines_6}/bin/prisma-fmt";
        };
      }) // {
      nixosModules.default = import ./nix/module.nix self;
    };
}
