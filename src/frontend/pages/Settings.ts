/**
 * Settings.ts
 * Placeholder page. Local-only flag and token budget live in shell state.
 */

import { el, on } from "../dom";

export function Settings(
  localOnly: boolean,
  budget: number,
  setLocalOnly: (value: boolean) => void,
  setBudget: (value: number) => void,
): HTMLElement {
  const toggle = el("input", { type: "checkbox" }) as HTMLInputElement;
  toggle.checked = localOnly;
  on(toggle, "change", () => setLocalOnly(toggle.checked));
  const budgetField = el("input", { type: "number", min: "1", value: String(budget) }) as HTMLInputElement;
  on(budgetField, "input", () => setBudget(Number(budgetField.value) || 1));
  return el("section", { class: "page" }, [
    el("h1", {}, ["Settings"]),
    el("label", { class: "field row" }, [toggle, el("span", {}, ["Local only"])]),
    el("label", { class: "field" }, [
      el("span", { class: "field-label" }, ["Token budget"]),
      budgetField,
    ]),
  ]);
}
