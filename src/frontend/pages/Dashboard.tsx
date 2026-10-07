/**
 * Dashboard.tsx
 * Sidebar picks the tool. Main area mounts that tool.
 */

import { useState } from "react";
import { EvidenceTool } from "./evidence/EvidenceTool";
import { NDISDecoder } from "./ndis/NDISDecoder";
import { SchoolTool } from "./school/SchoolTool";
import { Settings } from "./settings/Settings";
import { TraumaTool } from "./trauma/TraumaTool";

export type ToolId = "trauma" | "ndis" | "school" | "evidence" | "settings";

const TOOLS: Array<{ id: ToolId; label: string }> = [
  { id: "trauma", label: "Trauma Tool" },
  { id: "ndis", label: "NDIS Decoder" },
  { id: "school", label: "School Tools" },
  { id: "evidence", label: "Evidence Tools" },
  { id: "settings", label: "Settings" },
];

export function Dashboard({ initialTool = "trauma" }: { initialTool?: ToolId }) {
  const [tool, setTool] = useState<ToolId>(initialTool);
  return (
    <div className="shell">
      <aside className="sidebar">
        <p className="brand">Fence</p>
        <nav className="nav">
          {TOOLS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === tool ? "nav-item active" : "nav-item"}
              onClick={() => setTool(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="main">
        {tool === "trauma" ? <TraumaTool /> : null}
        {tool === "ndis" ? <NDISDecoder /> : null}
        {tool === "school" ? <SchoolTool /> : null}
        {tool === "evidence" ? <EvidenceTool /> : null}
        {tool === "settings" ? <Settings /> : null}
      </main>
    </div>
  );
}
