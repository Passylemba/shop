// @lovable.dev/vite-tanstack-config already includes ...
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import netlify from "@netlify/vite-plugin-tanstack-start";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts
    server: { entry: "server" },
  },
  // Add the Netlify plugin so the build outputs dist/client correctly
  vite: {
    plugins: [netlify()],
  },
});
