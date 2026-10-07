/**
 * betaManager.ts
 * In-memory beta list. Features are names only.
 */

const FEATURES = ["trauma", "ndis", "school", "evidence"];

const testers = new Map<string, string[]>();

/** Enroll a tester with the default feature list. */
export function enrollBetaTester(user: string): string[] {
  if (!testers.has(user)) testers.set(user, [...FEATURES]);
  return getBetaFeatures(user);
}

/** Return assigned features. Empty if the user is not enrolled. */
export function getBetaFeatures(user: string): string[] {
  return [...(testers.get(user) ?? [])];
}
