/**
 * PatternHistory.tsx
 * Patterns tracked over time for one person, from the tool runs linked to them.
 */

import { deleteObservation, listObservations, summarisePatterns } from "../../../data/observations";
import { TOOLS } from "../../toolRegistry";

function day(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString();
}

function Bars({ items, total }: { items: Array<{ label: string; count: number }>; total: number }) {
  return (
    <ul className="bars">
      {items.slice(0, 7).map((item) => (
        <li key={item.label}>
          <span className="bar-label">{item.label}</span>
          <span className="bar-track">
            <span className="bar-fill" style={{ width: `${Math.round((item.count / Math.max(total, 1)) * 100)}%` }} />
          </span>
          <span className="bar-count">{item.count}</span>
        </li>
      ))}
    </ul>
  );
}

export function PatternHistory({ personId }: { personId: string }) {
  const summary = summarisePatterns(personId);
  const recent = listObservations(personId).slice(0, 10);

  return (
    <section className="ai-box">
      <h2>Patterns over time</h2>
      {summary.notes === 0 ? (
        <p className="hint">
          No notes yet. Choose this person in "Who is this about?" on any tool, and each run is added here.
        </p>
      ) : (
        <>
          <p className="hint">
            {summary.notes} notes from {day(summary.first)} to {day(summary.last)}. {summary.withPatterns} showed a listed
            pattern. These are cues to check, not findings.
          </p>
          {summary.patterns.length ? (
            <>
              <h3>Patterns seen</h3>
              <Bars items={summary.patterns} total={summary.notes} />
            </>
          ) : null}
          {summary.needs.length ? (
            <>
              <h3>Possible needs</h3>
              <Bars items={summary.needs} total={summary.notes} />
            </>
          ) : null}
          <h3>Recent notes</h3>
          <ul className="draft-list">
            {recent.map((item) => (
              <li key={item.id} className="row">
                <div className="draft-item">
                  <strong>{TOOLS[item.kind].label}</strong> {day(item.at)}
                  <br />
                  <span className="hint">{item.redacted}</span>
                </div>
                <button type="button" className="ghost" onClick={() => deleteObservation(item.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
