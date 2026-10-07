/**
 * onboardingScreens.tsx
 * Four local screens. They do not run a workflow.
 */

import { STEPS, type OnboardingStep } from "./onboardingManager";

const COPY: Record<OnboardingStep, { title: string; body: string }> = {
  welcome: {
    title: "Welcome",
    body: "This drafts support notes from redacted text. It does not diagnose and it does not approve funding.",
  },
  privacy: {
    title: "Privacy",
    body: "The original stays in the preview. The workflow uses the redacted text. Review it before you continue.",
  },
  workflow: {
    title: "First workflow",
    body: "Choose Trauma, NDIS, School, or Evidence. You can change this later.",
  },
  quickstart: {
    title: "Quick start",
    body: "Paste a note, run the workflow, and read the draft. Empty input is rejected.",
  },
};

export function OnboardingScreens({ step }: { step: OnboardingStep }) {
  const screen = COPY[step];
  return (
    <section>
      <p>
        Step {STEPS.indexOf(step) + 1} of {STEPS.length}
      </p>
      <h1>{screen.title}</h1>
      <p>{screen.body}</p>
    </section>
  );
}
