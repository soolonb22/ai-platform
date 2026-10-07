/**
 * tierRegistry.ts
 * One list of subscriptions, licenses, and marketplace products.
 */

import { products, type Product } from "../marketplace/productCatalog";
import { licenseTiers, type LicenseTier } from "../licensing/licenseTiers";
import { tiers, type Tier } from "../subscriptions/tiers";

export interface TierRegistry {
  subscriptions: Tier[];
  licenses: LicenseTier[];
  marketplace: Product[];
}

export const registry: TierRegistry = {
  subscriptions: tiers,
  licenses: licenseTiers,
  marketplace: products,
};

export type AnyTier = Tier | LicenseTier | Product;

/** Find a subscription, license, or product by id. */
export function getTierById(id: string): AnyTier | null {
  return (
    registry.subscriptions.find((item) => item.id === id) ??
    registry.licenses.find((item) => item.id === id) ??
    registry.marketplace.find((item) => item.id === id) ??
    null
  );
}
