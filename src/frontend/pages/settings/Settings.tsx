/**
 * Settings.tsx
 * Local page. The toggle stays in component state. Nothing is sent.
 */

import { useState } from "react";
import { APP_VERSION } from "../../../version";

export function Settings() {
  const [advanced, setAdvanced] = useState(false);

  return (
    <section className="page">
      <h1>Settings</h1>
      <section>
        <h2>Privacy</h2>
        <p>
          Text is redacted on this device before a workflow runs. The original stays in the preview.
          Workflows use the redacted text. This page does not store notes.
        </p>
      </section>
      <section>
        <h2>Workflows</h2>
        <ul>
          <li>Trauma: patterns, needs, interventions, a regulation plan, and a plain explanation.</li>
          <li>NDIS: funding cues, plain rules, draft goals, evidence, and a draft agreement.</li>
          <li>School: a support plan, regulation menu, start strategies, and a staff note.</li>
          <li>Provider: a rewritten progress note, evidence, and optional goals.</li>
        </ul>
        <p className="hint">None of these approve funding or make a diagnosis.</p>
      </section>
      <section>
        <h2>Version</h2>
        <p>Phase 4 shell. Version {APP_VERSION}.</p>
      </section>
      <label className="field row">
        <input type="checkbox" checked={advanced} onChange={(event) => setAdvanced(event.target.checked)} />
        <span>Show advanced options</span>
      </label>
      {advanced ? (
        <p className="hint">Token budget 400. Approval in the workflows is still simulated.</p>
      ) : null}
    </section>
  );
}
