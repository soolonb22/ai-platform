/**
 * auditStore.ts
 * In-memory audit records. No file and no network.
 */

export interface AuditRecord {
  type: string;
  metadata: Record<string, string | number | boolean>;
  at: string;
}

const records: AuditRecord[] = [];

/** Append one record. */
export function addLog(record: AuditRecord): void {
  records.push(record);
}

/** Return a copy of the log. */
export function getLogs(): AuditRecord[] {
  return records.map((record) => ({ ...record, metadata: { ...record.metadata } }));
}

/** Drop every record. */
export function clearLogs(): void {
  records.length = 0;
}
