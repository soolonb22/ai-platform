/**
 * firstRunController.ts
 * In-memory first-run flag. Starting onboarding does not store a note.
 */

import { startOnboarding, type OnboardingStatus } from "../onboarding/onboardingManager";

const seen = new Set<string>();

/** True until markFirstRunComplete has been called. */
export function isFirstRun(user: string): boolean {
  return !seen.has(user);
}

/** Mark the user as returning and start the onboarding record. */
export function markFirstRunComplete(user: string): OnboardingStatus {
  seen.add(user);
  return startOnboarding(user);
}
