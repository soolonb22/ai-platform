/**
 * FileUpload.ts
 * Reads a local text file into memory. No network.
 */

import { el, on } from "../dom";

export function FileUpload(
  fileName: string,
  onFile: (name: string, text: string) => void,
): HTMLElement {
  const input = el("input", { class: "file-input", type: "file", accept: ".txt,.md,.csv" }) as HTMLInputElement;
  on(input, "change", () => {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onFile(file.name, String(reader.result ?? ""));
    reader.readAsText(file);
  });
  return el("div", { class: "field" }, [
    el("span", { class: "field-label" }, ["File"]),
    input,
    el("p", { class: "hint" }, [fileName ? `Loaded ${fileName}` : "Text files only. Stays in the browser."]),
  ]);
}
