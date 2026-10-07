# Fence (ai-platform)

Draft support notes from redacted text. Trauma, NDIS, school, and provider workflows that redact on the device, show a preview, and only then run. Nothing here diagnoses a person or approves funding.

## Quick start

```
npm install
npm run dev        # Vite dev server for the shell
npm run typecheck  # tsc across all ten phases
npm test           # tests/fixtures.ts
npm run build      # static build into dist/
```

`start.bat` runs install, test, build, and the dev server in one go on Windows.

## Layout

| Phase | Directory | What lives there |
| --- | --- | --- |
| 1 Foundation | `src/privacy`, `src/utils`, `src/pipeline` | redaction fence, normalise, token budget, safe errors |
| 2 Engines | `src/engines` | trauma, ndis, school, narrative |
| 3 Workflows | `src/workflows` | one linear runner per domain |
| 4 Front-end | `src/frontend` | React shell: dashboard, tools, preview modal |
| 5 PDF | `src/pdf` | library-free PDF generators that wrap and paginate |
| Data | `src/data`, `src/access` | saved drafts and plan choice in the browser, what each plan unlocks |
| AI | `src/ai`, `functions/api/ai.ts` | AI drafting request, browser client, and the Pages Function that calls Claude |
| 6 Deployment | `deployment` | Cloudflare Worker, Pages, GitHub Actions, env schema, versioning |
| 7 Monetization | `monetization` | subscriptions, licensing, marketplace, billing, tiers (mock) |
| 8 Scale | `scale` | multi-seat, enterprise, audit, offline, performance |
| 9 Integration | `integration` | unified API, error handler, wiring, release, checklist |
| 10 Launch | `launch` | marketing, docs, onboarding, first run, beta, strategy |

## Docs

- [Developer onboarding](launch/docs/developer-onboarding.md) — architecture and how to extend it
- [Getting started](launch/docs/gettingStarted.md)
- [Workflows](launch/docs/workflows.md)
- [Privacy](launch/docs/privacy.md)
- [Deployment](launch/docs/deployment.md)
- [Monetization](launch/docs/monetization.md)
- [Release strategy](launch/strategy/releaseStrategy.md)

## Status

Version 0.3.0. Every workflow refuses to run until the redacted preview is approved. Drafts save in the browser without the original note. AI drafting with Claude is optional, needs a confirmed second preview, and is switched on by setting the `AI_API_KEY` secret on the Pages project. Plans are a demo gate in the browser; billing is a mock ledger. See `integration/checklist/productionChecklist.ts` for the readiness list.