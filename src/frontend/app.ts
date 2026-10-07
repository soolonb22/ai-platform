/**
 * app.ts
 * Shell. Hooks are called once, in a fixed order, on every render.
 */

import { beginRender, createRoot, endRender, useState } from "./state/hooks";
import { el } from "./dom";
import { Sidebar, type PageId } from "./components/Sidebar";
import { NDISDecoder } from "./pages/NDISDecoder";
import { Settings } from "./pages/Settings";
import { TraumaTool } from "./pages/TraumaTool";

function view(): HTMLElement {
  const [page, setPage] = useState<PageId>("trauma");
  const [traumaText, setTraumaText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileText, setFileText] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [approved, setApproved] = useState(false);
  const [decoderText, setDecoderText] = useState("");
  const [localOnly, setLocalOnly] = useState(true);
  const [budget, setBudget] = useState(400);

  const main =
    page === "trauma"
      ? TraumaTool(
          { text: traumaText, fileName, fileText, previewOpen, approved },
          setTraumaText,
          (name, text) => {
            setFileName(name);
            setFileText(text);
            setApproved(false);
          },
          setPreviewOpen,
          setApproved,
        )
      : page === "decoder"
        ? NDISDecoder(decoderText, setDecoderText)
        : Settings(localOnly, budget, setLocalOnly, setBudget);

  return el("div", { class: "shell" }, [
    Sidebar(page, (next) => {
      setPreviewOpen(false);
      setPage(next);
    }),
    el("main", { class: "main" }, [main]),
  ]);
}

export function mount(root: HTMLElement): void {
  const instance = createRoot(() => {
    beginRender(instance);
    const tree = view();
    endRender();
    root.replaceChildren(tree);
  });
  instance.render();
}
