import mdx from "@mdx-js/rollup";
import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import "dotenv/config";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";

import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
installGlobals();
export default defineConfig({
  server: {
    port: 3000,
  },

  plugins: [
    mdx({
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
    }),
    !process.env.VITEST &&
      remix({
        ignoredRouteFiles: ["**/*.css", "**/*.test.{js,jsx,ts,tsx}"],
      }),
    tsconfigPaths(),
    process.env.NODE_ENV !== "production" &&
      process.env.SENTRY_AUTH_TOKEN &&
      process.env.SENTRY_ORG &&
      process.env.SENTRY_PROJECT &&
      sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        telemetry: false,
      }),
  ],

  build: {
    sourcemap: process.env.NODE_ENV !== "production",
    ssr: true,
  },
  test: {
    setupFiles: ["./tests/vitest.setup.ts"],
    environment: "jsdom",
    include: ["./app/**/*.test.{ts,tsx}"],
    globals: true,
  },
});
