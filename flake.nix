{
  description = "Development tools for okwilkins.dev";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      nixpkgs,
      flake-utils,
      ...
    }:
    flake-utils.lib.eachSystem
      [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
      ]
      (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          nodejs = pkgs.nodejs_26;

          syncNixToolsScript =
            assert pkgs.playwright-test.version == pkgs.playwright-driver.version;
            ''
              import json
              import os
              from pathlib import Path
              import subprocess
              import sys

              if "--install-tools" in sys.argv[1:]:
                  # INFO: install-tool is Containerbase's installer in the Renovate container
                  # Only the bot uses it
                  subprocess.run(["install-tool", "node", "${nodejs.version}"], check=True)
                  subprocess.run(["install-tool", "pnpm", "${pkgs.pnpm.version}"], check=True)

              manifest = json.loads(Path("package.json").read_text())
              manifest["packageManager"] = "pnpm@${pkgs.pnpm.version}"
              manifest["devDependencies"]["@playwright/test"] = "${pkgs.playwright-test.version}"
              Path("package.json").write_text(json.dumps(manifest, indent=4) + "\n")

              subprocess.run(
                  [
                      "pnpm", "install", "--lockfile-only",
                      "--ignore-scripts", "--no-frozen-lockfile",
                  ],
                  check=True,
                  env={**os.environ, "pnpm_config_pm_on_fail": "error"},
              )
            '';

          syncNixTools = pkgs.writers.writePython3Bin "sync-nix-tools" {
            makeWrapperArgs = [
              "--prefix"
              "PATH"
              ":"
              (pkgs.lib.makeBinPath [
                nodejs
                pkgs.pnpm
              ])
            ];
          } syncNixToolsScript;

          browserEnvironment = {
            PLAYWRIGHT_BROWSERS_PATH = "${pkgs.playwright-driver.browsers}";
            PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = "1";
            # Nix supplies the browsers' native libraries instead of distro packages.
            PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = "true";
            PLAYWRIGHT_VERSION = pkgs.playwright-test.version;
            FONTCONFIG_FILE = pkgs.makeFontsConf {
              fontDirectories = [ pkgs.dejavu_fonts ];
            };
          };

          # Make the matching Node API usable before the app has npm dependencies.
          playwrightNode = pkgs.writeShellApplication {
            name = "playwright-node";
            runtimeInputs = [ nodejs ];
            runtimeEnv = browserEnvironment // {
              NODE_PATH = "${pkgs.playwright-test}/lib/node_modules";
            };
            text = ''
              exec node "$@"
            '';
          };

          runSite = pkgs.writeShellApplication {
            name = "run-site";
            runtimeInputs = [
              nodejs
              pkgs.pnpm
            ];
            runtimeEnv.pnpm_config_pm_on_fail = "error";
            text = ''
              pnpm install --frozen-lockfile
              exec pnpm dev
            '';
          };

          tools = [
            nodejs
            pkgs.pnpm
            pkgs.playwright-test
            playwrightNode
            runSite
            syncNixTools
            pkgs.git
            pkgs.curl
            pkgs.jq
            pkgs.ripgrep
            pkgs.nixfmt
          ];
        in
        {
          lib.syncNixTools = syncNixToolsScript;

          devShells.default = pkgs.mkShell (
            browserEnvironment
            // {
              packages = tools;
              pnpm_config_pm_on_fail = "error";
            }
          );

          formatter = pkgs.nixfmt;
        }
      );
}
