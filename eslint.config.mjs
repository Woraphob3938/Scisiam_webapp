import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "main.js",
    "next-env.d.ts",

    // Local agent/tooling workspaces and generated QA artifacts are not app source.
    ".claude/**",
    ".agents/**",
    ".impeccable/**",
    ".obsidian/**",
    ".playwright-cli/**",
    "qa-screenshots/**",
  ]),
]);

export default eslintConfig;
