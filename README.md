# okwilkins.dev

My personal website, built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

## Run the website

With [Nix](https://nixos.org/download/) installed:

```sh
nix develop --command $SHELL
pnpm install
pnpm dev
```

Open [localhost:3000](http://localhost:3000). Edit `data/site.ts` for my profile and experience. Projects follow my [GitHub pins](https://github.com/okwilkins); public services come from [h8s](https://github.com/okwilkins/h8s). Both refresh hourly.

## Check

```sh
pnpm check
pnpm test
pnpm build
```

## Deploy

```sh
docker build -t personal-website .
docker run --rm -p 3000:3000 personal-website
```

Prometheus: `/metrics`. Health check: `/healthz`. JSON logs go to stdout; set `LOG_LEVEL` to adjust verbosity.
