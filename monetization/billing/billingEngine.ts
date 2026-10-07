/**
 * billingEngine.ts
 * Unified mock billing. Charges go through mockBillingProvider.
 */

import { charge, refund } from "../subscriptions/mockBillingProvider";
import { buildInvoice, type Invoice, type InvoiceItem } from "./invoiceBuilder";

export interface BillingRecord {
  user: string;
  invoice: Invoice;
}

const ledger: BillingRecord[] = [];

/** Charge the amount and store an invoice for the user. */
export function chargeUser(user: string, amount: number): Invoice {
  charge(amount);
  const invoice = buildInvoice(user, [{ name: "Charge", amount }]);
  ledger.push({ user, invoice });
  return invoice;
}

/** Refund the amount and store a negative invoice line. */
export function refundUser(user: string, amount: number): Invoice {
  refund(amount);
  const invoice = buildInvoice(user, [{ name: "Refund", amount: -amount }]);
  ledger.push({ user, invoice });
  return invoice;
}

/** Build an invoice from items and store it. Does not charge again. */
export function generateInvoice(user: string, items: InvoiceItem[]): Invoice {
  const invoice = buildInvoice(user, items);
  ledger.push({ user, invoice });
  return invoice;
}
