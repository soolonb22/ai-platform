/**
 * licenseManager.ts
 * In-memory licenses. Charges go through the mock provider.
 */

import { charge, generateInvoice, refund, type Invoice } from "../subscriptions/mockBillingProvider";
import { findLicenseTier, type LicenseTier } from "./licenseTiers";

export interface License {
  org: string;
  tier: LicenseTier;
  status: "active" | "revoked";
  invoice: Invoice | null;
}

const records = new Map<string, License>();

/** Charge the tier amount and store an active license. */
export function issueLicense(org: string, tierId: LicenseTier["id"]): License {
  const tier = findLicenseTier(tierId);
  const invoice = generateInvoice(charge(tier.amount));
  const license = { org, tier, status: "active" as const, invoice };
  records.set(org, license);
  return license;
}

/** Charge the current tier amount again. */
export function renewLicense(org: string): License {
  const current = records.get(org);
  if (!current || current.status !== "active") throw new Error("No active license.");
  const invoice = generateInvoice(charge(current.tier.amount));
  const license = { ...current, invoice };
  records.set(org, license);
  return license;
}

/** Refund the last charge and mark the license revoked. */
export function revokeLicense(org: string): License {
  const current = records.get(org);
  if (!current || current.status !== "active") throw new Error("No active license.");
  const invoice = generateInvoice(refund(current.tier.amount));
  const license = { ...current, status: "revoked" as const, invoice };
  records.set(org, license);
  return license;
}

/** Return the stored license, or null. */
export function getLicenseStatus(org: string): License | null {
  return records.get(org) ?? null;
}
