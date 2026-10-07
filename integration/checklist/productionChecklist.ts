/**
 * productionChecklist.ts
 * Readiness items from the current build. Not a certification.
 */

export interface ChecklistItem {
  section: string;
  item: string;
  status: "ready" | "partial" | "missing";
  note: string;
}

const ITEMS: ChecklistItem[] = [
  {
    section: "Privacy compliance",
    item: "Local and worker redaction run before engines",
    status: "partial",
    note: "Workflows redact first. The shell gates on a real Approve click. The API runners still simulate approval. Bare names can pass.",
  },
  {
    section: "Redaction verification",
    item: "Sample notes do not reach the engine unchanged",
    status: "partial",
    note: "Email, phone, labeled ids, dates, addresses, schools, providers, and labeled names are replaced. A bare name with no label can pass.",
  },
  {
    section: "Workflow stability",
    item: "Trauma, NDIS, school, and provider runners return results",
    status: "ready",
    note: "Empty input throws a safe error. Results are in memory only.",
  },
  {
    section: "PDF generation stability",
    item: "Four generators return a PDF buffer",
    status: "ready",
    note: "Headers are valid and /Length matches the stream. Single page, 40 lines max.",
  },
  {
    section: "Type safety",
    item: "tsc covers every phase",
    status: "ready",
    note: "npm run typecheck includes src, deployment, integration, launch, monetization, scale, and tests.",
  },
  {
    section: "Deployment pipeline health",
    item: "Worker, Pages, and Actions files exist",
    status: "partial",
    note: "wrangler.toml, .github/workflows/deploy.yml, and typecheck, test, and build scripts exist. Pages has no binding to the Worker yet.",
  },
  {
    section: "Billing system readiness",
    item: "Mock charges for subscriptions, licenses, and products",
    status: "partial",
    note: "Mock only. Billing engine is not the shared ledger. No persistence.",
  },
  {
    section: "Multi-seat + enterprise readiness",
    item: "Teams, seats, orgs, and audit log exist",
    status: "partial",
    note: "Seats are tied to an active licence. Audit is called by the four workflows. Org analytics are not.",
  },
  {
    section: "Offline mode verification",
    item: "Offline runner uses local workflows",
    status: "partial",
    note: "No Worker call. Cache can write worker text to disk.",
  },
  {
    section: "Performance scaling verification",
    item: "Batch, cache, and throttle helpers exist",
    status: "partial",
    note: "Helpers are unused by the runners.",
  },
];

/** Return a copy of the checklist. */
export function getProductionChecklist(): ChecklistItem[] {
  return ITEMS.map((item) => ({ ...item }));
}