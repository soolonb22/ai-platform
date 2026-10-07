/**
 * Sidebar.ts
 * Page navigation. Does not own state.
 */

import { el, on } from "../dom";

export type PageId = "trauma" | "decoder" | "settings";

const ITEMS: Array<{ id: PageId; label: string }> = [
  { id: "trauma", label: "TraumaTool" },
  { id: "decoder", label: "NDISDecoder" },
  { id: "settings", label: "Settings" },
];

export function Sidebar(page: PageId, onNavigate: (page: PageId) => void): HTMLElement {
  return el("aside", { class: "sidebar" }, [
    el("p", { class: "brand" }, ["Fence"]),
    el(
      "nav",
      { class: "nav" },
      ITEMS.map((item) => {
        const button = el("button", {
          class: item.id === page ? "nav-item active" : "nav-item",
          type: "button",
        }, [item.label]);
        return on(button, "click", () => onNavigate(item.id));
      }),
    ),
  ]);
}
