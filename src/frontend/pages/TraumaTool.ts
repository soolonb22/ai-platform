/**
 * TraumaTool.ts
 * Placeholder page. Text and file stay in shell state.
 */

import { redactLocal } from "../../privacy/localRedactor";
import { el, on } from "../dom";
import { FileUpload } from "../components/FileUpload";
import { PreviewModal } from "../components/PreviewModal";
import { TextInput } from "../components/TextInput";

export type TraumaState = {
  text: string;
  fileName: string;
  fileText: string;
  previewOpen: boolean;
  approved: boolean;
};

export function TraumaTool(
  state: TraumaState,
  setText: (value: string) => void,
  setFile: (name: string, text: string) => void,
  setPreviewOpen: (open: boolean) => void,
  setApproved: (approved: boolean) => void,
): HTMLElement {
  const source = [state.text, state.fileText].filter(Boolean).join("\n\n");
  const review = el("button", { class: "primary", type: "button" }, ["Review"]);
  on(review, "click", () => setPreviewOpen(true));
  return el("section", { class: "page" }, [
    el("h1", {}, ["TraumaTool"]),
    el("p", { class: "hint" }, ["Placeholder. Review the redacted text before any later step."]),
    TextInput(state.text, setText, "Notes"),
    FileUpload(state.fileName, setFile),
    el("p", { class: "hint" }, [state.approved ? "Approved for this session." : "Not approved."]),
    el("div", { class: "row" }, [review]),
    PreviewModal(
      state.previewOpen,
      source,
      redactLocal(source),
      () => {
        setApproved(true);
        setPreviewOpen(false);
      },
      () => setPreviewOpen(false),
    ),
  ]);
}
