/**
 * TextInput.ts
 * Controlled text field. Value lives in the caller hook.
 */

import { el, on } from "../dom";

export function TextInput(
  value: string,
  onChange: (value: string) => void,
  label = "Text",
): HTMLElement {
  const field = el("textarea", { class: "text-input" }, []) as HTMLTextAreaElement;
  field.value = value;
  field.placeholder = "Paste text. Nothing is sent until you review it.";
  on(field, "input", () => onChange(field.value));
  return el("label", { class: "field" }, [
    el("span", { class: "field-label" }, [label]),
    field,
  ]);
}
