# Working on okwilkins.dev

- Keep it simple. Prefer small changes and existing tools over new abstractions or dependencies.
- Never create git commits. Do not deploy or push without an explicit request.
- Follow the latest user instructions over preferences recorded here.

## Development

Use the Nix environment:

```sh
nix develop --command $SHELL
pnpm install
pnpm dev
```

Do not add `.envrc` or use `path:.` in the documented Nix command. Keep Playwright and its browsers matched to the flake.

The stack is Next.js App Router, React, TypeScript, Tailwind CSS, and shadcn/ui. Content lives in `data/site.ts`. Keep copy in first person and the README short, with clear instructions for running the website.

## Design

- This is a focused personal site: experience and selected projects. No blog, notes, or knowledge system.
- Follow the [UX laws](https://raw.githubusercontent.com/keysjoao/laws-of-ux-skills/refs/heads/main/laws-of-ux/references/ux-laws-complete.md), with readable text, clear hierarchy, keyboard access, and usable touch targets.
- Keep the dark glass subtle enough for text to stay readable. Apply frosting to the backdrop.
- Keep canvas work bounded, use a smaller mobile rendering budget, pause when hidden, and provide a static reduced-motion version. Let cursor trails decay when the pointer leaves.

## Checks and browser testing

```sh
pnpm check
pnpm test
pnpm build
```

Use headless browser tests by default. Visible Chrome windows disrupt the user's Hyprland workspaces and cursor.

Check narrow mobile layouts and report emulation or compositor limits honestly. Do not claim testing on a physical phone.

### Hyprland

If Hyprland is running (`HYPRLAND_INSTANCE_SIGNATURE` is set), headed browser tests must use a temporary rule before launching Chrome:

```sh
hyprctl eval 'ow_preview_rule = hl.window_rule({
  name = "codex-personal-website",
  match = { class = "^codex-website-preview$" },
  workspace = "special:codex-website-preview silent",
  no_initial_focus = true, no_focus = true, no_follow_mouse = true,
  suppress_event = "activate activatefocus fullscreenoutput",
  render_unfocused = true, no_anim = true, float = true
})'
```

Launch Playwright Chromium with `--ozone-platform=x11` and `--class=codex-website-preview`. Verify its window is on the silent special workspace and never gains focus. Hidden workspaces may throttle rendering; do not change compositor settings to improve test results.

Always close the browser and disable the rule in `finally`:

```sh
hyprctl eval 'ow_preview_rule:set_enabled(false)'
```

Reuse the rule with `ow_preview_rule:set_enabled(true)` for later tests. Never switch workspaces, warp the cursor, or reload the user's configuration. Keep this setup out of the Nix commands and README.

## Runtime

Target a Node service on h8s. Preserve `/metrics`, `/healthz`, and structured JSON logs. Keep Prometheus route labels bounded and exclude query strings from request logs.
