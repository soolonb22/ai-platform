# Deployment

The Worker entry is `deployment/worker/index.ts`. It accepts POST only and routes `/redact`, `/ai`, and `/pdf`. `ENVIRONMENT=off` returns 503. Errors log a code, not the request text.

`deployment/worker/wrangler.toml` names the Worker and sets `AI_MODE`, `MAX_TOKENS`, and `ENVIRONMENT`. Its `main` is `index.ts`, relative to the config file, because Wrangler resolves paths from the directory that holds `wrangler.toml`.

Pages routing is `deployment/pages/_routes.json`. `/api/*`, `/redact`, `/ai`, and `/pdf` are included so they are not served as static files. The shell paths are excluded. `pages.config.json` builds with `npm run build` into `dist`.

`deployment/github/deploy.yml` is the source copy of the pipeline and `.github/workflows/deploy.yml` is the live one. Keep them identical. On a push to `main` it installs, typechecks, builds, tests, then deploys the Worker and Pages with Wrangler. Tokens are GitHub secret names only: set `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in the repository secrets.

Still open: Pages does not forward `/redact`, `/ai`, or `/pdf` to the Worker. Add a service binding or a custom route before the shell calls the Worker. Until then the shell runs every workflow in the browser.