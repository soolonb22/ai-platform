/**
 * onboardingManager.ts
 * In-memory onboarding steps. No note text is stored.
 */

export const STEPS = ["welcome", "privacy", "workflow", "quickstart"] as const;

export type OnboardingStep = (typeof STEPS)[number];

export interface OnboardingStatus {
  user: string;
  completed: OnboardingStep[];
  done: boolean;
}

const records = new Map<string, OnboardingStep[]>();

/** Start a record. An existing record is left as it is. */
export function startOnboarding(user: string): OnboardingStatus {
  if (!records.has(user)) records.set(user, []);
  return getOnboardingStatus(user);
}

/** Mark a known step complete. Unknown steps are ignored. */
export function completeStep(user: string, step: string): OnboardingStatus {
  const current = records.get(user) ?? [];
  if (STEPS.includes(step as OnboardingStep) && !current.includes(step as OnboardingStep)) {
    current.push(step as OnboardingStep);
  }
  records.set(user, current);
  return getOnboardingStatus(user);
}

/** Return completed steps. Unknown users are not done. */
export function getOnboardingStatus(user: string): OnboardingStatus {
  const completed = records.get(user) ?? [];
  return { user, completed: [...completed], done: STEPS.every((step) => completed.includes(step)) };
}
