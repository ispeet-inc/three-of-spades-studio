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
    // Only run ESLint in development to speed up builds
    mode === "development" &&
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
  // Add build optimizations for production
  build: {
    target: "es2015",
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
          redux: ["@reduxjs/toolkit", "react-redux", "redux-saga"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
}));
