# Developer Onboarding — Platform Architecture Overview

Welcome to the Platform OS. This document explains how the system is structured, how data flows, and where you plug in as a developer.

The product is called **Fence** in the shell. The package is `ai-platform`. The version lives in `deployment/build/version.json` and is mirrored in `src/version.ts`.

## 1. High-Level Architecture

The platform is built in 10 phases, each corresponding to a major layer:

1. Foundation
2. Intelligence Engines
3. Workflow Pipelines
4. Front-End Experience
5. PDF Generation
6. Deployment
7. Monetization
8. Scale
9. Integration
10. Launch

Each phase is isolated, modular, and designed to scale independently. Phases 1 to 5 live under `src/`. Phases 6 to 10 are top-level directories that import from `src/`, never the other way round.

## 2. Directory Structure

```
ai-platform/
  src/
    privacy/        Phase 1  localRedactor, previewPayload, workerRedactor
    utils/          Phase 1  normalise, tokenBudget, errors
    pipeline/       Phase 1  input -> redaction -> preview -> worker -> mockAI -> output
    engines/        Phase 2  trauma, ndis, school, narrative
    workflows/      Phase 3  trauma, ndis, school, provider
    frontend/       Phase 4  React shell: pages, components, styles
    pdf/            Phase 5  writePdf plus four generators and mapResults
    version.ts
  deployment/       Phase 6  worker, pages, github, env, build
  monetization/     Phase 7  subscriptions, licensing, marketplace, billing, tiers
  scale/            Phase 8  multiseat, enterprise, audit, offline, performance
  integration/      Phase 9  api, errors, wiring, release, checklist
  launch/           Phase 10 marketing, docs, onboarding, firstRun, beta, strategy
  tests/            fixtures.ts: one check per workflow plus fence and PDF
  .github/workflows/deploy.yml
```

Each directory corresponds to a phase of the system.

## 3. Privacy Fence (Core Security Layer)

All user data passes through:

1. `src/privacy/localRedactor.ts` — on-device redaction. Regex only. Emails, phones, labeled identifiers, dates, addresses, schools, providers, and names become placeholders such as `[name]` and `[school]`.
2. `src/privacy/previewPayload.ts` — user approval. Pairs the original with the redacted text. `approved` starts `false`.
3. `src/privacy/workerRedactor.ts` — server-side safety. A second pass for leftover identifiers, clinical terms, and prohibited content.

Every workflow begins with these modules. Engines only ever see worker text. The original note is never rendered in a result panel and never logged.

`src/privacy/fence.ts` runs all three in order and is the only entry point workflows use. `src/privacy/vocabulary.ts` holds the NDIS terms the redactor must keep and the everyday capitalised words it must not treat as names.

The fence is heuristic. A name with no title, label, verb, or action word near it can pass. Treat it as a floor, not a guarantee.

## 4. Intelligence Engines

Engines encapsulate domain logic under `src/engines/`:

- **Trauma** — `detectPatterns`, `mapBehaviourToNeed`, `generateInterventions`, `buildRegulationPlan`, `explainTrauma`
- **NDIS** — `extractFunding`, `interpretRules`, `generateGoals`, `buildEvidence`, `rewriteProgressNotes`, `buildServiceAgreement`
- **School** — `buildSupportPlan`, `generateRegulationMenu`, `generateEFStrategies`, `buildSchoolCommunication`
- **Narrative** — `toPlainLanguage`, `traumaStory`, `explainBehaviour`, `simplifyRules`

They take redacted text and return structured results. Every engine is a pure function with no I/O. Each result carries a limit line such as "Not a diagnosis" or "Not a funding decision". Keep that line when you extend an engine.

## 5. Workflow Pipelines

Workflows orchestrate engines plus privacy under `src/workflows/`:

- `runTraumaWorkflow`
- `runNDISWorkflow`
- `runSchoolWorkflow`
- `runProviderWorkflow`

Each workflow is linear, predictable, and testable. The shape is always:

```
input -> redactLocal -> buildPreview -> gate on approval
      -> redactWorker -> engines -> logEvent("workflow-run") -> result
```

Every runner takes `(input, approved)`. Anything other than `true` stops it before the engine. Empty input throws `PlatformError("EMPTY_INPUT")`. The result object always contains `preview` and `workerText` beside the engine output.

## 6. Front-End Experience

UI components live in `src/frontend/`:

- `pages/Dashboard.tsx` — the sidebar picks the tool
- `pages/trauma/TraumaTool.tsx`
- `pages/ndis/NDISDecoder.tsx`
- `pages/school/SchoolTool.tsx`
- `pages/evidence/EvidenceTool.tsx`
- `pages/settings/Settings.tsx`
- `components/PreviewModal.tsx`, `TextInput.tsx`, `FileUpload.tsx`

The entry is `main.tsx`, mounted by `index.html`. Vite serves `src/frontend` as its root. The UI calls workflows directly in the browser, shows the preview modal, and only runs the workflow after the user clicks Approve. Download buttons build PDFs client-side.

## 7. PDF Generation

PDF modules under `src/pdf/` generate local PDFs:

- `serviceAgreement.ts` — service agreements
- `evidencePack.ts` — evidence packs
- `traumaPlan.ts` — trauma plans
- `schoolCommunication.ts` — school communication

All four call `writePdf(lines)`, which emits a text PDF as a `Uint8Array` with no library. `mapResults.ts` converts a workflow result into the input shape for each generator. All PDFs are generated client-side. Long lines wrap, long documents run onto more pages, and curly quotes and dashes are mapped to plain characters.

## 8. Deployment Layer

Under `deployment/`:

- **Cloudflare Worker** — `worker/index.ts` routes POST `/redact`, `/ai`, and `/pdf`. `worker/wrangler.toml` holds the bindings; its `main` is relative to the config file. `ENVIRONMENT=off` returns 503.
- **Cloudflare Pages** — `pages/_routes.json` and `pages.config.json`. Build output is `dist`.
- **GitHub Actions CI/CD** — `github/deploy.yml` is the source copy; `.github/workflows/deploy.yml` is the live one. Keep them identical.
- **Environment schema** — `env/env.schema.json` and `env/example.env`. Secrets are names only.
- **Versioning and build pipeline** — `build/version.ts` reads and bumps `version.json`; `build/build.ts` compiles and writes a manifest.

This layer makes the system shippable.

## 9. Monetization and Scale

Monetization (`monetization/`):

- Subscriptions — `tiers.ts`, `subscriptionManager.ts`, `mockBillingProvider.ts`
- Licensing — `licenseTiers.ts`, `licenseManager.ts`
- Marketplace — `productCatalog.ts`, `purchaseManager.ts`
- Billing — `billingEngine.ts`, `invoiceBuilder.ts`
- Tier registry — `tierRegistry.ts`

Scale (`scale/`):

- Multi-seat accounts — `teamManager.ts`, `seatAllocator.ts`, `permissions.ts`
- Enterprise features — `orgManager.ts`, `orgSettings.ts`, `orgAnalytics.ts`
- Audit logs — `auditLogger.ts`, `auditStore.ts`. Listed keys only. No note text.
- Offline mode — `offlineCache.ts`, `offlineWorkflowRunner.ts`. Node only, never imported by the shell.
- Performance utilities — `batchProcessor.ts`, `cacheLayer.ts`, `throttle.ts`

These layers turn the platform into a sustainable product. Every store is in memory. Billing is a mock ledger with no card data and no network.

## 10. Integration and Launch

Integration (`integration/`):

- Unified API — `api/apiRouter.ts` maps `/trauma`, `/ndis`, `/school`, and `/provider` to the runners
- Global error handling — `errors/globalErrorHandler.ts` returns fixed messages, never input text
- System wiring — `wiring/systemMap.ts` and `wiring/wiring.ts` look up a workflow, engine, or PDF builder by name
- Release packaging — `release/packager.ts` and `releaseNotes.ts`
- Production checklist — `checklist/productionChecklist.ts`

Launch (`launch/`):

- Marketing site — `marketing/`
- Documentation site — `docs/`
- Onboarding flows — `onboarding/`
- First-run experience — `firstRun/`
- Beta program — `beta/`
- Release strategy — `strategy/releaseStrategy.md`

This is the public-facing layer.

## 11. Developer Workflow

When adding new functionality:

1. Identify the correct engine, or add one under `src/engines/<domain>/` as a pure function with a limit line.
2. Extend or create a workflow in `src/workflows/`. Redact first. Log with `logEvent`.
3. Add UI components in `src/frontend/pages/` and route them from `Dashboard.tsx`.
4. Add PDF output if needed: a generator in `src/pdf/` and a mapper in `mapResults.ts`.
5. Update monetization or scale layers if relevant.
6. Wire into the unified API in `integration/api/apiRouter.ts` and `integration/wiring/wiring.ts`.
7. Add a check to `tests/fixtures.ts`.
8. Document in `launch/docs`.

Then run the three validation steps:

```
npm run typecheck   # tsc over every phase
npm test            # tests/fixtures.ts
npm run build       # vite build into dist
```

CI runs the same three on every push to `main`.

## 12. Core Principles

- Privacy first — redact before anything else runs, never log input text
- Modularity — one phase, one directory, no upward imports
- Clarity — every output says what it is not
- Extensibility — pure functions in, structured results out
- Safety — mock billing, in-memory stores, fixed error messages

Welcome to the system. You're extending an OS, not just writing code.