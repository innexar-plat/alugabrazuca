import { defineConfig } from "vitest/config";
import { resolve } from "path";
import swc from "unplugin-swc";

export default defineConfig({
  test: {
    globals: true,
    root: "./",
    include: ["src/**/*.spec.ts"],
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    server: {
      deps: {
        external: ["express"],
      },
    },
  },
  plugins: [
    swc.vite({
      module: { type: "es6" },
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
