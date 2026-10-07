# Deployment

The Worker entry is `deployment/worker/index.ts`. It accepts POST only and routes `/redact`, `/ai`, and `/pdf`. `ENVIRONMENT=off` returns 503. Errors log a code, not the request text.

Pages routing is `deployment/pages/_routes.json`. `/api/*`, `/redact`, `/ai`, and `/pdf` are included so they are not served as static files. The shell paths are excluded. `pages.config.json` builds with `npm run build` into `dist`.

`deployment/github/deploy.yml` checks out main, installs, builds, tests, then deploys the Worker and Pages with Wrangler. Tokens are GitHub secret names only.

Not in place yet: `wrangler.toml`, a copy of the workflow at `.github/workflows/deploy.yml`, and `npm` build and test scripts. A push will not deploy until those exist.
