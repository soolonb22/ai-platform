# Deployment

The Worker entry is `deployment/worker/index.ts`. It accepts POST only and routes `/redact`, `/ai`, and `/pdf`. `ENVIRONMENT=off` returns 503. Errors log a code, not the request text.

`deployment/worker/wrangler.toml` names the Worker and sets `AI_MODE`, `MAX_TOKENS`, and `ENVIRONMENT`. Its `main` is `index.ts`, relative to the config file, because Wrangler resolves paths from the directory that holds `wrangler.toml`.

Pages routing is `deployment/pages/_routes.json`. `/api/*`, `/redact`, `/ai`, and `/pdf` are included so they are not served as static files. The shell paths are excluded. `pages.config.json` builds with `npm run build` into `dist`.

`deployment/github/deploy.yml` is the source copy of the pipeline and `.github/workflows/deploy.yml` is the live one. Keep them identical. On a push to `main` it installs, typechecks, builds, and tests. If `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are set in the repository secrets, it then deploys Pages, which includes the `/api/ai` function. Without them the run still passes and skips the deploy. The standalone Worker is not deployed by CI.

AI drafting runs as a Pages Function, `functions/api/ai.ts`, at `/api/ai` on the same site, so no separate Worker or binding is needed. `wrangler pages deploy dist` picks up the `functions` folder automatically. Turn AI on by setting the key as a secret, then redeploy:

```
npx wrangler pages secret put AI_API_KEY --project-name ai-platform
```

Optional settings: `AI_MODEL` picks another Claude model, `ALLOWED_ORIGINS` lists extra sites allowed to call the endpoint, and `AI_MODE=off` switches AI off. The standalone Worker routes `/ai` to the same handler.