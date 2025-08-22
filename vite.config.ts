import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";
import path from "path";
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    eslint({
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: ["node_modules/**", "dist/**"],
      cache: true,
      failOnWarning: false,
      failOnError: false,
      lintOnStart: false,
      emitWarning: false,
    }),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
