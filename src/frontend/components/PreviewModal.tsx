/**
 * PreviewModal.tsx
 * Shows original and redacted text. Approve and cancel are callbacks.
 * This component does not send anything.
 */

export interface PreviewModalProps {
  originalText: string;
  redactedText: string;
  onApprove: () => void;
  onCancel: () => void;
}

export function PreviewModal({ originalText, redactedText, onApprove, onCancel }: PreviewModalProps) {
  return (
    <div className="modal-back">
      <div className="modal" role="dialog" aria-modal="true">
        <h2>Preview</h2>
        <p className="hint">Original stays here. Only the redacted text can move forward.</p>
        <h3>Original</h3>
        <pre className="preview-block">{originalText || "(empty)"}</pre>
        <h3>Redacted</h3>
        <pre className="preview-block">{redactedText || "(empty)"}</pre>
        <div className="row">
          <button type="button" className="primary" onClick={onApprove}>
            Approve
          </button>
          <button type="button" className="ghost" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
