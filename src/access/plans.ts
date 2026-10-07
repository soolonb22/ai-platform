/**
 * plans.ts
 * What each plan unlocks. The four rule-based tools and PDF downloads are free on every plan.
 * Paid plans add AI drafting and room for more saved drafts.
 *
 * This is a demo gate that runs in the browser. It is not payment and not enforcement.
 * Prices mirror monetization/subscriptions/tiers.ts, and a test keeps the two in step.
 *
 * Exports: PlanId, Plan, PLANS, findPlan
 */

export type PlanId = "free" | "parent" | "coordinator" | "provider";

export interface Plan {
  id: PlanId;
  label: string;
  price: string;
  aiDraftsPerDay: number;
  savedDrafts: number;
}

export const PLANS: Plan[] = [
  { id: "free", label: "Free", price: "$0", aiDraftsPerDay: 0, savedDrafts: 5 },
  { id: "parent", label: "Parent", price: "$29\u2013$49 / month", aiDraftsPerDay: 10, savedDrafts: 50 },
  { id: "coordinator", label: "Coordinator", price: "$99\u2013$149 / month", aiDraftsPerDay: 40, savedDrafts: 200 },
  { id: "provider", label: "Provider", price: "$299\u2013$499 / month", aiDraftsPerDay: 100, savedDrafts: 500 },
];

/** The plan with this id, or Free for anything unknown. */
export function findPlan(id: string | null | undefined): Plan {
  return PLANS.find((plan) => plan.id === id) ?? PLANS[0];
}
