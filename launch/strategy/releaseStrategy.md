# Release strategy

This build is `0.1.1`. Billing is mock. Approval in the API runners is simulated; the shell gates on a real Approve click. A push to `main` runs typecheck, build, and test, then deploys once the Cloudflare secrets exist.

## Pre-launch checklist

- Privacy fence runs before every workflow. Bare names can still pass. Fix that before a public note is accepted.
- The React shell approves before the worker pass. The API runners still simulate approval. Make `handleRequest` take an approval flag before it is exposed.
- PDF buffers start with `%PDF-1.4` and `/Length` matches the stream. Single page only.
- `wrangler.toml`, `.github/workflows/deploy.yml`, and `typecheck`, `test`, and `build` scripts exist. `tsc` covers every phase.
- Settings and the release manifest read `APP_VERSION` and `version.json`. Keep the two values equal.
- No account store. Do not promise signup.
- Pages has no binding to the Worker. Add one before the shell calls `/ai`.

## Beta rollout plan

- Enroll testers with `enrollBetaTester`. The default features are trauma, ndis, school, and evidence.
- First run shows the privacy modal, then the four onboarding screens.
- Feedback goes through `submitFeedback`. Email and long numbers are stripped. Keep the store on the device.
- Beta is local and in memory. Do not send notes to the Worker until the preview gate is real on every path.

## Marketing rollout plan

- Publish `launch/marketing`: home, features, pricing, FAQ.
- Prices match the mock ranges. The page says checkout is not live.
- Do not claim a diagnosis or a funding approval.
- Link the FAQ to the privacy and workflow docs.

## Documentation rollout plan

- Ship `launch/docs`: developer onboarding, getting started, workflows, privacy, deployment, monetization.
- Getting started must say signup is not live.
- Deployment must list the open Pages-to-Worker binding.
- Update the docs in the same change as a workflow or price change.

## Production deployment steps

1. Set `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in GitHub secrets. Do not commit them.
2. Confirm `npm run typecheck`, `npm test`, and `npm run build` exit 0 locally.
3. Push to `main`. Actions runs the same three, then Worker deploy, then Pages deploy of `dist`.
4. Bind the Pages project to the Worker for `/redact`, `/ai`, and `/pdf`.
5. `ENVIRONMENT=off` must return 503 before a bad build is left up.

## Post-launch monitoring

- Count workflow runs, PDF builds, and team actions. Do not log note text.
- Audit events keep `orgId`, `teamId`, `workflow`, `pdf`, `action`, `count`, and `ok` only.
- Watch 400, 404, and 503 on `/redact`, `/ai`, and `/pdf`.
- A redaction miss is a stop-ship. Pull `ENVIRONMENT` to `off`.

## Versioning strategy

- Semantic version in `deployment/build/version.json`, mirrored in `src/version.ts`.
- `build.ts` bumps the patch, then compiles.
- Release notes come from `generateReleaseNotes(version, changes)`.
- A workflow or fence change bumps minor. A breaking API path bumps major.
- Marketing, Settings, and the release manifest read the same version.