/**
 * drafts.ts
 * Saved drafts, kept in this browser only.
 * A draft holds the redacted text, the workflow result, and any AI draft.
 * The original note is removed before anything is stored.
 *
 * Exports: Draft, listDrafts, getDraft, saveDraft, deleteDraft, clearDrafts
 */

import type { WorkflowKind } from "../workflows/kinds";
import { readJson, removeKey, writeJson } from "./store";

const KEY = "fence.drafts.v1";

export interface Draft {
  id: string;
  kind: WorkflowKind;
  createdAt: string;
  title: string;
  redacted: string;
  result: unknown;
  aiDraft: string;
}

/** The parts of any workflow result that drafts rely on. */
export interface SavableResult {
  preview: { original: string; redacted: string; approved: boolean };
  workerText: string;
}

export type SaveOutcome = { ok: true; draft: Draft } | { ok: false; message: string };

function newId(): string {
  const random = globalThis.crypto?.randomUUID?.();
  return random ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function titleFrom(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > 60 ? `${flat.slice(0, 57)}...` : flat || "Untitled draft";
}

/** Newest first. */
export function listDrafts(): Draft[] {
  const drafts = readJson<Draft[]>(KEY, []);
  return Array.isArray(drafts) ? drafts : [];
}

export function getDraft(id: string): Draft | null {
  return listDrafts().find((draft) => draft.id === id) ?? null;
}

/** Save a result. Refuses once the plan limit is reached. */
export function saveDraft(
  input: { kind: WorkflowKind; result: SavableResult; aiDraft?: string },
  limit: number,
): SaveOutcome {
  const drafts = listDrafts();
  if (drafts.length >= limit) {
    return {
      ok: false,
      message: `Your plan keeps ${limit} drafts. Delete one in Drafts, or change plan in Settings.`,
    };
  }
  const redacted = input.result.preview.redacted;
  const result = { ...input.result, preview: { original: "", redacted, approved: true } };
  const draft: Draft = {
    id: newId(),
    kind: input.kind,
    createdAt: new Date().toISOString(),
    title: titleFrom(redacted),
    redacted,
    result,
    aiDraft: input.aiDraft ?? "",
  };
  writeJson(KEY, [draft, ...drafts]);
  return { ok: true, draft };
}

export function deleteDraft(id: string): void {
  writeJson(
    KEY,
    listDrafts().filter((draft) => draft.id !== id),
  );
}

export function clearDrafts(): void {
  removeKey(KEY);
}
