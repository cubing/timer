import { barelyServe } from "barely-a-dev-server";
import { build } from "esbuild";
import { injectManifest } from "workbox-build";
import { barelyServeCommonOptions } from "./barelyServeCommonOptions";

await barelyServe({
  ...barelyServeCommonOptions,
  dev: false,
  outDir: "dist/web/timer.cubing.net",
});

await build({
  entryPoints: ["src/service-worker/sw.ts"],
  bundle: true,
  format: "esm", // TODO: test in Firefox
  outfile: "dist/web/timer.cubing.net/sw.js",
});

await new Promise((resolve) => setTimeout(resolve, 1000));

await injectManifest({
  globDirectory: "dist/web/timer.cubing.net/",
  globPatterns: ["**/*.{js,ico,html,png,css,ttf,woff,woff2,txt,svg}"],
  swDest: "dist/web/timer.cubing.net/sw.js",
  swSrc: "dist/web/timer.cubing.net/sw.js",
});
