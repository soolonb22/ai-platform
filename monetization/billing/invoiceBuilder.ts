/**
 * invoiceBuilder.ts
 * Totals line items into one invoice object. No charge is made here.
 */

export interface InvoiceItem {
  name: string;
  amount: number;
}

export interface Invoice {
  user: string;
  items: InvoiceItem[];
  total: number;
  date: string;
}

/** Sum the items. Negative amounts are allowed for a refund line. */
export function buildInvoice(user: string, items: InvoiceItem[]): Invoice {
  const lines = items.map((item) => ({ name: item.name, amount: item.amount }));
  const total = lines.reduce((sum, item) => sum + item.amount, 0);
  return {
    user,
    items: lines,
    total,
    date: new Date().toISOString().slice(0, 10),
  };
}
