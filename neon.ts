import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  // Declare your Neon services here
  preview: {
    realtime: true,
  },
  auth: true,
  // Private bucket for CVs and payment proofs. Credentials are injected as
  // standard AWS_* variables by `neon deploy` / `neon env pull`.
  buckets: {
    cvs: {},
    'payment-screenshots': {},
  },
  aiGateway: true,
  functions: {
    platform: {
      name: "Platform status",
      source: "functions/platform.ts",
    },
  },
  // Branch policy: per-branch tuning
  branch: (branch) => {
    if (branch.isDefault) {
      // Default branch: no overrides, uses project defaults
      return {};
    }
    if (!branch.exists) {
      // New non-default branches: auto-expire
      // Run `neon checkout <name>` to create a new branch with these settings
      return { ttl: "7d" };
    }
    // Existing branch: no changes
    return {};
  },
});
