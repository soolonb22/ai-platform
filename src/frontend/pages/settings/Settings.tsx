/**
 * Settings.tsx
 * Privacy notes, the demo plan picker, saved drafts, and the version.
 * Everything here is stored on this device only.
 */

import { useState } from "react";
import { PLANS } from "../../../access/plans";
import { clearDrafts, listDrafts } from "../../../data/drafts";
import { aiDraftsUsedToday, getPlan, setPlan } from "../../../data/plan";
import { APP_VERSION } from "../../../version";
import { useStoreVersion } from "../../state/useStore";

export function Settings() {
  useStoreVersion();
  const plan = getPlan();
  const saved = listDrafts().length;
  const [advanced, setAdvanced] = useState(false);

  return (
    <section className="page">
      <h1>Settings</h1>
      <section>
        <h2>Privacy</h2>
        <p>
          Text is redacted on this device before any workflow runs, and nothing runs until you approve the preview. The four
          tools work entirely in this browser.
        </p>
        <p>
          Saved drafts keep only the redacted text and results, in this browser. The original note is never stored. AI
          drafting sends the redacted text to Claude, an AI model by Anthropic, only after you see it and choose Send to AI.
        </p>
      </section>
      <section>
        <h2>Plan</h2>
        <p className="hint">Demo plans. No payment is taken and no account is created. Your choice is saved on this device.</p>
        {PLANS.map((item) => (
          <label key={item.id} className="field row">
            <input type="radio" name="plan" checked={plan.id === item.id} onChange={() => setPlan(item.id)} />
            <span>
              <strong>{item.label}</strong> {item.price}.{" "}
              {item.aiDraftsPerDay ? `${item.aiDraftsPerDay} AI drafts a day` : "No AI drafts"}, {item.savedDrafts} saved
              drafts.
            </span>
          </label>
        ))}
        <p className="hint">
          AI drafts used today: {aiDraftsUsedToday()} of {plan.aiDraftsPerDay}.
        </p>
      </section>
      <section>
        <h2>Saved drafts</h2>
        <p>
          {saved} of {plan.savedDrafts} saved on this device.
        </p>
        <button
          type="button"
          className="ghost"
          disabled={saved === 0}
          onClick={() => {
            if (window.confirm("Delete every saved draft on this device? This cannot be undone.")) clearDrafts();
          }}
        >
          Delete all drafts
        </button>
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
        <p>Version {APP_VERSION}.</p>
      </section>
      <label className="field row">
        <input type="checkbox" checked={advanced} onChange={(event) => setAdvanced(event.target.checked)} />
        <span>Show advanced options</span>
      </label>
      {advanced ? (
        <p className="hint">Token budget 400. Every workflow waits for your approval of the redacted preview.</p>
      ) : null}
    </section>
  );
}
