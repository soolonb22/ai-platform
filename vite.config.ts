import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "src/frontend",
  plugins: [react()],
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  server: {
    fs: {
      allow: [".."],
    },
  },
  build: {
    outDir: "../../dist",
    emptyOutDir: true,
  },
});
