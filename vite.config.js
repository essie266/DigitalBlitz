import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { copyFileSync, existsSync } from "fs";

export default defineConfig(({ mode }) => {
  // Load env variables from .env, .env.[mode], and .env.local
  // The third argument '' causes loadEnv to return all variables (no VITE_ prefix filtering)
  const env = loadEnv(mode, process.cwd(), "");

  // Build a small process.env object with only the keys your app uses.
  // Add other keys here as needed. Values come from .env or your shell.
  const injectedProcessEnv = {
    REACT_APP_API_URL: env.REACT_APP_API_URL || "https://stacksapp-backend.onrender.com",
    STACKL_HEALTH_TOKEN: env.STACKL_HEALTH_TOKEN || ""
  };

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
    server: {
      proxy: {
        "/api": "https://stacksapp-backend.onrender.com",
      },
    },
    build: {
      outDir: "dist",
    },
    // Replace `process.env` references in your client code with the small object above.
    // This avoids modifying your application source files.
    define: {
      "process.env": JSON.stringify(injectedProcessEnv),
    },
    closeBundle() {
      const redirectsPath = resolve(__dirname, "_redirects");
      const distPath = resolve(__dirname, "dist/_redirects");

      if (existsSync(redirectsPath)) {
        try {
          copyFileSync(redirectsPath, distPath);
          console.log("✅ _redirects file copied to dist/");
        } catch (err) {
          console.error("❌ Failed to copy _redirects file:", err);
        }
      } else {
        console.warn("⚠️  No _redirects file found at project root.");
      }
    },
  };
});