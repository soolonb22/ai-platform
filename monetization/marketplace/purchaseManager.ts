/**
 * purchaseManager.ts
 * In-memory purchases. Charges go through the mock provider.
 */

import { charge, generateInvoice, type Invoice } from "../subscriptions/mockBillingProvider";
import { findProduct, type Product } from "./productCatalog";

export interface Purchase {
  user: string;
  product: Product;
  invoice: Invoice;
}

const history = new Map<string, Purchase[]>();

/** Charge the product price and store the purchase. */
export function purchaseProduct(user: string, productId: string): Purchase {
  const product = findProduct(productId);
  const invoice = generateInvoice(charge(product.price));
  const purchase = { user, product, invoice };
  const prior = history.get(user) ?? [];
  history.set(user, [...prior, purchase]);
  return purchase;
}

/** Return the user's purchases. Empty if none. */
export function getPurchaseHistory(user: string): Purchase[] {
  return history.get(user) ?? [];
}
