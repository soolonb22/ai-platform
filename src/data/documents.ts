/**
 * documents.ts
 * AI documents saved per person, on this device only.
 * Exports: SavedDocument, listDocuments, saveDocument, deleteDocument, deleteDocumentsFor
 */

import type { DocumentKind, GeneratedDocument } from "../ai/documents";
import { readJson, writeJson } from "./store";

const KEY = "fence.documents.v1";
const MAX_PER_PERSON = 30;

export interface SavedDocument {
  id: string;
  personId: string;
  kind: DocumentKind;
  createdAt: string;
  document: GeneratedDocument;
}

function all(): SavedDocument[] {
  const list = readJson<SavedDocument[]>(KEY, []);
  return Array.isArray(list) ? list : [];
}

/** Newest first. */
export function listDocuments(personId: string): SavedDocument[] {
  return all().filter((item) => item.personId === personId);
}

export function saveDocument(personId: string, kind: DocumentKind, document: GeneratedDocument): SavedDocument {
  const saved: SavedDocument = {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
    personId,
    kind,
    createdAt: new Date().toISOString(),
    document,
  };
  const mine = [saved, ...listDocuments(personId)].slice(0, MAX_PER_PERSON);
  writeJson(KEY, [...mine, ...all().filter((item) => item.personId !== personId)]);
  return saved;
}

export function deleteDocument(id: string): void {
  writeJson(
    KEY,
    all().filter((item) => item.id !== id),
  );
}

export function deleteDocumentsFor(personId: string): void {
  writeJson(
    KEY,
    all().filter((item) => item.personId !== personId),
  );
}
