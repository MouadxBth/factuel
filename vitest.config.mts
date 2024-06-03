import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "edge-runtime",
    server: { deps: { inline: ["convex-test"] } },
    include: ["convex/**/*.{test,spec}.{js,ts}"], // Only include test files in the convex folder
    coverage: {
      reporter: ["text"],
      include: ["convex/files.ts", "convex/users.ts", "convex/schema.ts"], // Only collect coverage from specified files
    },
    reporters: ["verbose"],
  },
});
