/**
 * Dashboard.tsx
 * Sidebar picks the tool. Main area mounts that tool.
 */

import { useState } from "react";
import { Drafts } from "./drafts/Drafts";
import { getPlan } from "../../data/plan";
import { useStoreVersion } from "../state/useStore";
import { EvidenceTool } from "./evidence/EvidenceTool";
import { NDISDecoder } from "./ndis/NDISDecoder";
import { SchoolTool } from "./school/SchoolTool";
import { Settings } from "./settings/Settings";
import { TraumaTool } from "./trauma/TraumaTool";

export type ToolId = "trauma" | "ndis" | "school" | "evidence" | "drafts" | "settings";

const TOOLS: Array<{ id: ToolId; label: string }> = [
  { id: "trauma", label: "Trauma Tool" },
  { id: "ndis", label: "NDIS Decoder" },
  { id: "school", label: "School Tools" },
  { id: "evidence", label: "Evidence Tools" },
  { id: "drafts", label: "Drafts" },
  { id: "settings", label: "Settings" },
];

export function Dashboard({ initialTool = "trauma" }: { initialTool?: ToolId }) {
  const [tool, setTool] = useState<ToolId>(initialTool);
  useStoreVersion();
  const plan = getPlan();
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
        <div className="plan-chip">
          <span>Plan: {plan.label}</span>
          <button type="button" className="link" onClick={() => setTool("settings")}>
            Change plan
          </button>
        </div>
      </aside>
      <main className="main">
        {tool === "trauma" ? <TraumaTool /> : null}
        {tool === "ndis" ? <NDISDecoder /> : null}
        {tool === "school" ? <SchoolTool /> : null}
        {tool === "evidence" ? <EvidenceTool /> : null}
        {tool === "drafts" ? <Drafts /> : null}
        {tool === "settings" ? <Settings /> : null}
      </main>
    </div>
  );
}
