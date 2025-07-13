import { vitePlugin as remix } from "@remix-run/dev";
import { expressDevServer } from "remix-express-dev-server";
import { remixRoutes } from "remix-routes/vite";
import { defineConfig } from "vite";
import { envOnlyMacros } from "vite-env-only";
import devtoolsJson from "vite-plugin-devtools-json";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  build: {
    target: "esnext", // so we can use top-level await
  },
  server: {
    allowedHosts: [], // TODO
    port: Number(process.env.PORT || 3000),
  },
  plugins: [
    devtoolsJson(),
    expressDevServer(),
    envOnlyMacros(),
    remix({
      future: {
        unstable_optimizeDeps: true,
        v3_fetcherPersist: true,
        v3_lazyRouteDiscovery: true,
        v3_relativeSplatPath: true,
        v3_routeConfig: true,
        v3_singleFetch: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
    remixRoutes(),
  ],
});

/** @see https://remix.run/docs/en/main/guides/single-fetch#enable-single-fetch-types */
declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}
