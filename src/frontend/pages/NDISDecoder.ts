/**
 * NDISDecoder.ts
 * Placeholder page. Input only.
 */

import { el } from "../dom";
import { TextInput } from "../components/TextInput";

export function NDISDecoder(text: string, setText: (value: string) => void): HTMLElement {
  return el("section", { class: "page" }, [
    el("h1", {}, ["NDISDecoder"]),
    el("p", { class: "hint" }, ["Placeholder. No decode step in Phase 1."]),
    TextInput(text, setText, "Plan text"),
  ]);
}
