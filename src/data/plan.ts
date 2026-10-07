/**
 * plan.ts
 * The plan chosen on this device and how many AI drafts were used today.
 * An AI draft only counts once it comes back, so nothing is spent on a cancelled or failed request.
 *
 * Exports: getPlan, setPlan, aiDraftsUsedToday, aiDraftsLeftToday, recordAiDraft
 */

import { findPlan, type Plan, type PlanId } from "../access/plans";
import { readJson, writeJson } from "./store";

const PLAN_KEY = "fence.plan.v1";
const USAGE_KEY = "fence.aiUsage.v1";

type Usage = { day: string; used: number };

/** Local calendar day, e.g. 2026-10-07. */
export function today(now = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function getPlan(): Plan {
  return findPlan(readJson<string | null>(PLAN_KEY, null));
}

export function setPlan(id: PlanId): void {
  writeJson(PLAN_KEY, findPlan(id).id);
}

export function aiDraftsUsedToday(day = today()): number {
  const usage = readJson<Usage | null>(USAGE_KEY, null);
  return usage && usage.day === day ? usage.used : 0;
}

export function aiDraftsLeftToday(day = today()): number {
  return Math.max(0, getPlan().aiDraftsPerDay - aiDraftsUsedToday(day));
}

/** Count one finished AI draft against today. */
export function recordAiDraft(day = today()): void {
  writeJson(USAGE_KEY, { day, used: aiDraftsUsedToday(day) + 1 });
}
