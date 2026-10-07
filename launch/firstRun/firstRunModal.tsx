/**
 * firstRunModal.tsx
 * First-run explanation. Continue marks the run complete.
 */

import { markFirstRunComplete } from "./firstRunController";

export function FirstRunModal({ user, onContinue }: { user: string; onContinue: () => void }) {
  return (
    <div className="modal-back">
      <div className="modal" role="dialog" aria-modal="true">
        <h2>Before the first note</h2>
        <p>This drafts a trauma, NDIS, school, or evidence note. It does not diagnose and it does not approve funding.</p>
        <p>The original stays in the preview. The workflow uses the redacted text. Review that text before you continue.</p>
        <p>Paste a note, run one workflow, and read the draft. Empty input is rejected.</p>
        <button
          type="button"
          onClick={() => {
            markFirstRunComplete(user);
            onContinue();
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
