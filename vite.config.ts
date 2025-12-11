import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: ["**/test_data.csv", "**/*.csv", "**/*.zst", "**/uploads/**"],
    },
  },
  build: {
    sourcemap: false,
    minify: "esbuild",
    target: "es2020",
  },
  optimizeDeps: {
    include: ["react", "react-dom", "recharts"],
  },
});
