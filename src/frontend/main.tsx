/**
 * main.tsx
 * React entry. The vanilla main.ts remains for the old shell.
 */

import { createRoot } from "react-dom/client";
import { Dashboard } from "./pages/Dashboard";

const root = document.querySelector("#app");
if (!root) {
  document.body.textContent = "Missing #app.";
} else {
  try {
    createRoot(root).render(<Dashboard />);
  } catch (error) {
    root.textContent = error instanceof Error ? error.message : "The app did not start.";
  }
}
