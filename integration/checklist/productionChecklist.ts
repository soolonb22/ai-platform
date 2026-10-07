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
    note: "Workflows redact first through runFence. Every path, shell and API, refuses to run without explicit approval.",
  },
  {
    section: "Redaction verification",
    item: "Sample notes do not reach the engine unchanged",
    status: "partial",
    note: "NDIS terms are kept. Email, phone, ids, dates, addresses, schools, providers, and names near a title, label, verb, or action word are replaced. A name with none of those can pass.",
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
    note: "Headers are valid, every /Length and xref offset is exact, long lines wrap, and long documents paginate.",
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
    note: "Pages serves the app and the /api/ai function from one site. CI typechecks, tests, and builds; its deploy steps need the Cloudflare secrets in GitHub.",
  },
  {
    section: "AI drafting",
    item: "Redacted text to a Claude draft, after a second preview",
    status: "partial",
    note: "Origin check, size limits, kill switch, and server re-redaction are in place. Needs AI_API_KEY. No per-user limit on the server yet.",
  },
  {
    section: "Saved drafts",
    item: "Drafts kept in the browser without the original note",
    status: "ready",
    note: "Plan limits apply. Delete one or all at any time. Nothing is uploaded.",
  },
  {
    section: "Plan checks",
    item: "Tools check the plan before AI drafting and saving",
    status: "partial",
    note: "Browser-only demo gate. No accounts, no payment, no server enforcement.",
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