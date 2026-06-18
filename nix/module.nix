self: { config, lib, pkgs, ... }:

let
  cfg = config.services.penultimate-guitar;
in {
  options.services.penultimate-guitar = {
    enable = lib.mkEnableOption "penultimate-guitar Next.js service";

    package = lib.mkOption {
      type = lib.types.package;
      default = self.packages.${pkgs.stdenv.hostPlatform.system}.default;
      description = "The penultimate-guitar package to use.";
    };

    port = lib.mkOption {
      type = lib.types.port;
      default = 3000;
      description = "Port the app listens on.";
    };

    hostname = lib.mkOption {
      type = lib.types.str;
      default = "127.0.0.1";
      description = "Hostname the app binds to.";
    };

    environmentFile = lib.mkOption {
      type = lib.types.path;
      description = ''
        Path to a file containing secrets as environment variables.
        Must be readable by the service user and NOT stored in the Nix store.
        Required vars: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL,
        SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET.
      '';
    };

    postgresql = {
      enable = lib.mkEnableOption "local PostgreSQL instance managed by this module";
    };
  };

  config = lib.mkIf cfg.enable {
    services.postgresql = lib.mkIf cfg.postgresql.enable {
      enable = true;
      ensureDatabases = [ "penultimate_guitar" ];
      ensureUsers = [{
        name = "penultimate_guitar";
        ensureDBOwnership = true;
      }];
    };

    systemd.services.penultimate-guitar-migrate = lib.mkIf cfg.postgresql.enable {
      description = "penultimate-guitar Prisma migrations";
      wantedBy = [ "multi-user.target" ];
      after = [ "postgresql.service" ];
      requires = [ "postgresql.service" ];
      before = [ "penultimate-guitar.service" ];

      serviceConfig = {
        Type = "oneshot";
        RemainAfterExit = true;
        EnvironmentFile = cfg.environmentFile;
        ExecStart = "${pkgs.nodejs_22}/bin/node ${cfg.package}/node_modules/.bin/prisma migrate deploy --schema=${cfg.package}/prisma/schema.prisma";
        WorkingDirectory = cfg.package;
        DynamicUser = true;
        PrivateTmp = true;
        ProtectSystem = "strict";
        NoNewPrivileges = true;
      };
    };

    systemd.services.penultimate-guitar = {
      description = "penultimate-guitar Next.js app";
      wantedBy = [ "multi-user.target" ];
      after = [ "network.target" ]
        ++ lib.optionals cfg.postgresql.enable [ "penultimate-guitar-migrate.service" ];
      requires = lib.optionals cfg.postgresql.enable [ "penultimate-guitar-migrate.service" ];

      environment = {
        PORT = toString cfg.port;
        HOSTNAME = cfg.hostname;
        NODE_ENV = "production";
        PRISMA_QUERY_ENGINE_LIBRARY = "${pkgs.prisma-engines_6}/lib/libquery_engine.node";
      };

      serviceConfig = {
        ExecStart = "${pkgs.nodejs_22}/bin/node ${cfg.package}/server.js";
        WorkingDirectory = cfg.package;
        EnvironmentFile = cfg.environmentFile;
        DynamicUser = true;
        PrivateTmp = true;
        ProtectSystem = "strict";
        NoNewPrivileges = true;
        Restart = "on-failure";
        RestartSec = "5s";
      };
    };
  };
}
