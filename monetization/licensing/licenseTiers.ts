/**
 * licenseTiers.ts
 * Annual school prices and an enterprise monthly range.
 * The charge uses the listed amount, or the enterprise low end.
 */

export interface LicenseTier {
  id: "small-school" | "medium-school" | "large-school" | "enterprise";
  label: string;
  amount: number;
  period: "year" | "month";
  maxMonthly?: number;
}

export const licenseTiers: LicenseTier[] = [
  { id: "small-school", label: "Small school", amount: 3000, period: "year" },
  { id: "medium-school", label: "Medium school", amount: 7500, period: "year" },
  { id: "large-school", label: "Large school", amount: 15000, period: "year" },
  { id: "enterprise", label: "Enterprise", amount: 1000, period: "month", maxMonthly: 5000 },
];

export function findLicenseTier(id: LicenseTier["id"]): LicenseTier {
  const tier = licenseTiers.find((item) => item.id === id);
  if (!tier) throw new Error("Unknown license tier.");
  return tier;
}
