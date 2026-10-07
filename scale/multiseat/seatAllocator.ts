/**
 * seatAllocator.ts
 * Seat caps by license tier. In memory only.
 */

import { getLicenseStatus } from "../../monetization/licensing/licenseManager";
import type { LicenseTier } from "../../monetization/licensing/licenseTiers";

const SEAT_LIMIT: Record<LicenseTier["id"], number> = {
  "small-school": 10,
  "medium-school": 30,
  "large-school": 80,
  enterprise: 200,
};

export interface SeatUsage {
  org: string;
  tier: LicenseTier["id"];
  used: number;
  limit: number;
}

const seats = new Map<string, SeatUsage>();

/** Take one seat when the org has an active licence. */
export function allocateSeat(org: string, tier?: LicenseTier["id"]): SeatUsage {
  const license = getLicenseStatus(org);
  if (!license || license.status !== "active") throw new Error("No active license.");
  const activeTier = tier && tier !== license.tier.id ? tier : license.tier.id;
  if (activeTier !== license.tier.id) throw new Error("Seat tier does not match the licence.");
  const limit = SEAT_LIMIT[license.tier.id];
  const current = seats.get(org) ?? { org, tier: license.tier.id, used: 0, limit };
  current.tier = license.tier.id;
  current.limit = limit;
  if (current.used >= current.limit) throw new Error("Seat limit reached.");
  current.used += 1;
  seats.set(org, current);
  return current;
}

/** Free one seat. Does nothing below zero. */
export function releaseSeat(org: string): SeatUsage {
  const current = seats.get(org);
  if (!current) throw new Error("No seat record.");
  current.used = Math.max(0, current.used - 1);
  return current;
}

/** Return usage, or a zero record if the org has none. */
export function getSeatUsage(org: string, tier: LicenseTier["id"] = "small-school"): SeatUsage {
  return seats.get(org) ?? { org, tier, used: 0, limit: SEAT_LIMIT[tier] };
}
