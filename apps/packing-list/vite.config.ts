import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";

export default defineConfig({
  plugins: [wasm(), react(), TanStackRouterVite()],

  worker: {
    format: "es",
    plugins: () => [wasm()],
  },

  build: {
    target: "esnext",
  },
});
