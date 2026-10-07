/**
 * tracking.ts
 * Links tool runs to the person chosen in "Who is this about?".
 * Exports: withActivePersonNames(text), recordForActivePerson(kind, result)
 */

import { redactKnownNames } from "../privacy/knownNames";
import type { WorkflowKind } from "../workflows/kinds";
import { addObservation } from "./observations";
import { getActivePerson, namesOf } from "./people";

/** Swap the chosen person's name and nicknames for [name] before the preview and the workflow. */
export function withActivePersonNames(text: string): string {
  const person = getActivePerson();
  return person ? redactKnownNames(text, namesOf(person)) : text;
}

/** Add the result to the chosen person's pattern history. Does nothing when no one is chosen. */
export function recordForActivePerson(kind: WorkflowKind, result: { preview: { redacted: string }; workerText: string }): void {
  const person = getActivePerson();
  if (person) addObservation(person.id, kind, result);
}
