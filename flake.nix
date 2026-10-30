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
          nodejs = pkgs.nodejs_24;

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
            pkgs.git
            pkgs.curl
            pkgs.jq
            pkgs.ripgrep
            pkgs.nixfmt
          ];
        in
        {
          devShells.default = pkgs.mkShell (browserEnvironment // { packages = tools; });

          formatter = pkgs.nixfmt;
        }
      );
}
