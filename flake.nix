{
  description = "penultimate-guitar";

  inputs = {
    # nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.05";
    nixpkgs.follows = "nixpkgs";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system: {
      packages.default = nixpkgs.legacyPackages.${system}.callPackage ./nix/package.nix {};
    }) // {
      nixosModules.default = import ./nix/module.nix self;
    };
}
