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
    note: "Workflows redact first. Approval is still simulated. Bare names can pass.",
  },
  {
    section: "Redaction verification",
    item: "Sample notes do not reach the engine unchanged",
    status: "partial",
    note: "Email, phone, and labeled ids are replaced. Participant can be over-redacted.",
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
    status: "partial",
    note: "Headers are valid. Stream length does not match. Shapes differ from workflows.",
  },
  {
    section: "Deployment pipeline health",
    item: "Worker, Pages, and Actions files exist",
    status: "missing",
    note: "No wrangler.toml, no workflow in .github, and no npm build script.",
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
    note: "Seats are not tied to a license. Audit is not called by workflows.",
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
