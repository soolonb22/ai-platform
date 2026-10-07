# Release strategy

This build is `0.1.1`. Billing is mock. Approval is simulated. A push to main will not deploy until the missing pipeline files exist.

## Pre-launch checklist

- Privacy fence runs before every workflow. Bare names can still pass. Fix that before a public note is accepted.
- Preview approval is simulated. The UI must approve before the worker pass.
- PDF buffers start with `%PDF-1.4`, but `/Length` does not match the stream. Fix that before a download is offered.
- `wrangler.toml`, `.github/workflows/deploy.yml`, and `npm` build and test scripts are missing.
- Settings says `0.4.0`. The version file says `0.1.1`. Use `getVersion()` in both.
- No account store. Do not promise signup.

## Beta rollout plan

- Enroll testers with `enrollBetaTester`. The default features are trauma, ndis, school, and evidence.
- First run shows the privacy modal, then the four onboarding screens.
- Feedback goes through `submitFeedback`. Email and long numbers are stripped. Keep the store on the device.
- Beta is local and in memory. Do not send notes to the Worker until the preview gate is real.

## Marketing rollout plan

- Publish `launch/marketing`: home, features, pricing, FAQ.
- Prices match the mock ranges. The page says checkout is not live.
- Do not claim a diagnosis or a funding approval.
- Link the FAQ to the privacy and workflow docs.

## Documentation rollout plan

- Ship `launch/docs`: getting started, workflows, privacy, deployment, monetization.
- Getting started must say signup is not live.
- Deployment must list the missing Wrangler config and Actions path.
- Update the docs in the same change as a workflow or price change.

## Production deployment steps

1. Add `deployment/worker/wrangler.toml` and the env bindings `AI_MODE`, `MAX_TOKENS`, `ENVIRONMENT`.
2. Copy `deployment/github/deploy.yml` to `.github/workflows/deploy.yml`.
3. Add `build` and `test` scripts. Point Pages and the build script at the same output directory.
4. Fill `tsconfig.json`. Confirm `tsc` exits 0.
5. Set `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in GitHub secrets. Do not commit them.
6. Push to main. Worker deploy, then Pages deploy of `dist`.
7. `ENVIRONMENT=off` must return 503 before a bad build is left up.

## Post-launch monitoring

- Count workflow runs, PDF builds, and team actions. Do not log note text.
- Audit events keep `orgId`, `teamId`, `workflow`, `pdf`, `action`, `count`, and `ok` only.
- Watch 400, 404, and 503 on `/redact`, `/ai`, and `/pdf`.
- A redaction miss is a stop-ship. Pull `ENVIRONMENT` to `off`.

## Versioning strategy

- Semantic version in `deployment/build/version.json`.
- `build.ts` bumps the patch, then compiles.
- Release notes come from `generateReleaseNotes(version, changes)`.
- A workflow or fence change bumps minor. A breaking API path bumps major.
- Marketing, Settings, and the release manifest read the same version.
