/**
 * tiers.ts
 * Plan ranges. The charge uses the low end. Not a live price.
 */

export interface Tier {
  id: "parent" | "coordinator" | "provider";
  label: string;
  minMonthly: number;
  maxMonthly: number;
}

export const tiers: Tier[] = [
  { id: "parent", label: "Parent", minMonthly: 29, maxMonthly: 49 },
  { id: "coordinator", label: "Coordinator", minMonthly: 99, maxMonthly: 149 },
  { id: "provider", label: "Provider", minMonthly: 299, maxMonthly: 499 },
];

export function findTier(id: Tier["id"]): Tier {
  const tier = tiers.find((item) => item.id === id);
  if (!tier) throw new Error("Unknown tier.");
  return tier;
}
