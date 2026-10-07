/**
 * mockBillingProvider.ts
 * In-memory charges. No card data and no network.
 */

export interface Invoice {
  id: string;
  amount: number;
  note: string;
}

const invoices: Invoice[] = [];
let sequence = 1;

/** Record a charge. Amount must be above zero. */
export function charge(amount: number): Invoice {
  if (amount <= 0) throw new Error("Charge amount must be above zero.");
  const invoice = { id: `inv-${sequence++}`, amount, note: "Mock charge." };
  invoices.push(invoice);
  return invoice;
}

/** Record a refund against a prior charge. */
export function refund(amount: number): Invoice {
  if (amount <= 0) throw new Error("Refund amount must be above zero.");
  const invoice = { id: `inv-${sequence++}`, amount: -amount, note: "Mock refund." };
  invoices.push(invoice);
  return invoice;
}

/** Return a copy of one invoice. */
export function generateInvoice(details: Invoice): Invoice {
  return { id: details.id, amount: details.amount, note: details.note };
}
