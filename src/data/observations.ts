/**
 * observations.ts
 * Each tool run linked to a person becomes an observation: the redacted note plus the
 * patterns and possible needs the engines found. Kept on this device only.
 * The summary is how the app tracks patterns over time.
 *
 * Exports: Observation, listObservations, addObservation, deleteObservation,
 *          deleteObservationsFor, summarisePatterns, summaryLines
 */

import { mapBehaviourToNeed } from "../engines/trauma/behaviourToNeed";
import { detectPatterns } from "../engines/trauma/patterns";
import type { WorkflowKind } from "../workflows/kinds";
import { readJson, writeJson } from "./store";

const KEY = "fence.observations.v1";
const MAX_PER_PERSON = 200;

export interface Observation {
  id: string;
  personId: string;
  kind: WorkflowKind;
  at: string;
  redacted: string;
  patterns: string[];
  needs: string[];
}

export interface PatternSummary {
  notes: number;
  withPatterns: number;
  patterns: Array<{ label: string; count: number }>;
  needs: Array<{ label: string; count: number }>;
  first: string | null;
  last: string | null;
}

function all(): Observation[] {
  const list = readJson<Observation[]>(KEY, []);
  return Array.isArray(list) ? list : [];
}

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Newest first. */
export function listObservations(personId: string): Observation[] {
  return all().filter((item) => item.personId === personId);
}

export function addObservation(
  personId: string,
  kind: WorkflowKind,
  result: { preview: { redacted: string }; workerText: string },
): Observation {
  const hits = detectPatterns(result.workerText).hits;
  const observation: Observation = {
    id: newId(),
    personId,
    kind,
    at: new Date().toISOString(),
    redacted: result.preview.redacted,
    patterns: hits.map((hit) => hit.label),
    needs: hits.length ? mapBehaviourToNeed(result.workerText).needs : [],
  };
  const mine = [observation, ...listObservations(personId)].slice(0, MAX_PER_PERSON);
  writeJson(KEY, [...mine, ...all().filter((item) => item.personId !== personId)]);
  return observation;
}

export function deleteObservation(id: string): void {
  writeJson(
    KEY,
    all().filter((item) => item.id !== id),
  );
}

export function deleteObservationsFor(personId: string): void {
  writeJson(
    KEY,
    all().filter((item) => item.personId !== personId),
  );
}

function tally(values: string[]): Array<{ label: string; count: number }> {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}

export function summarisePatterns(personId: string): PatternSummary {
  const notes = listObservations(personId);
  return {
    notes: notes.length,
    withPatterns: notes.filter((item) => item.patterns.length).length,
    patterns: tally(notes.flatMap((item) => item.patterns)),
    needs: tally(notes.flatMap((item) => item.needs)),
    first: notes.length ? notes[notes.length - 1].at : null,
    last: notes.length ? notes[0].at : null,
  };
}

/** Plain lines for an AI document request. No dates, so nothing time-identifying leaves the device. */
export function summaryLines(summary: PatternSummary): string[] {
  if (!summary.notes) return ["No notes recorded yet."];
  const lines = [`Notes recorded: ${summary.notes}`];
  for (const item of summary.patterns.slice(0, 7)) lines.push(`${item.label}: in ${item.count} of ${summary.notes} notes`);
  if (summary.needs.length) {
    lines.push(`Most common possible needs: ${summary.needs.slice(0, 5).map((item) => `${item.label} (${item.count})`).join(", ")}`);
  }
  return lines;
}
