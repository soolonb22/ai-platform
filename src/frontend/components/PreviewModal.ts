/**
 * PreviewModal.ts
 * Shows original and redacted text. Approval is a callback, not a send.
 */

import { el, on } from "../dom";

export function PreviewModal(
  open: boolean,
  original: string,
  redacted: string,
  onApprove: () => void,
  onClose: () => void,
): HTMLElement | null {
  if (!open) return null;
  const approve = el("button", { class: "primary", type: "button" }, ["Approve redacted text"]);
  const close = el("button", { class: "ghost", type: "button" }, ["Close"]);
  on(approve, "click", onApprove);
  on(close, "click", onClose);
  return el("div", { class: "modal-back" }, [
    el("div", { class: "modal", role: "dialog" }, [
      el("h2", {}, ["Preview"]),
      el("p", { class: "hint" }, ["Original stays here. Only the redacted text can move forward."]),
      el("h3", {}, ["Original"]),
      el("pre", { class: "preview-block" }, [original || "(empty)"]),
      el("h3", {}, ["Redacted"]),
      el("pre", { class: "preview-block" }, [redacted || "(empty)"]),
      el("div", { class: "row" }, [approve, close]),
    ]),
  ]);
}
