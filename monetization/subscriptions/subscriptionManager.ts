/**
 * subscriptionManager.ts
 * In-memory subscriptions. Charges go through the mock provider.
 */

import { charge, generateInvoice, refund, type Invoice } from "./mockBillingProvider";
import { findTier, type Tier } from "./tiers";

export interface Subscription {
  user: string;
  tier: Tier;
  status: "active" | "cancelled";
  invoice: Invoice | null;
}

const records = new Map<string, Subscription>();

/** Charge the tier minimum and store an active subscription. */
export function createSubscription(user: string, tierId: Tier["id"]): Subscription {
  const tier = findTier(tierId);
  const invoice = generateInvoice(charge(tier.minMonthly));
  const subscription = { user, tier, status: "active" as const, invoice };
  records.set(user, subscription);
  return subscription;
}

/** Refund the last charge and mark the subscription cancelled. */
export function cancelSubscription(user: string): Subscription {
  const current = records.get(user);
  if (!current || current.status !== "active") throw new Error("No active subscription.");
  const invoice = generateInvoice(refund(current.tier.minMonthly));
  const subscription = { ...current, status: "cancelled" as const, invoice };
  records.set(user, subscription);
  return subscription;
}

/** Refund the old tier minimum and charge the new one. */
export function upgradeSubscription(user: string, newTierId: Tier["id"]): Subscription {
  const current = records.get(user);
  if (!current || current.status !== "active") throw new Error("No active subscription.");
  refund(current.tier.minMonthly);
  const tier = findTier(newTierId);
  const invoice = generateInvoice(charge(tier.minMonthly));
  const subscription = { user, tier, status: "active" as const, invoice };
  records.set(user, subscription);
  return subscription;
}

/** Return the stored subscription, or null. */
export function getSubscriptionStatus(user: string): Subscription | null {
  return records.get(user) ?? null;
}
