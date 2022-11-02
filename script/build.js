import { build } from "esbuild";
import { barelyServe } from "barely-a-dev-server";
import { injectManifest } from "workbox-build";

barelyServe({
  dev: false,
  entryRoot: "src/timer.cubing.net",
  outDir: "dist/timer.cubing.net",
  esbuildOptions: {
    external: ["crypto"],
    loader: { ".svg": "copy", ".ico": "copy" },
    banner: {
      js: "globalThis.global = globalThis; // Workaround for a `pouch-db` dep. 😕\n",
    },
    sourcemap: true,
  },
});

await build({
  entryPoints: ["src/service-worker/sw.ts"],
  bundle: true,
  format: "cjs", // 😕 Can't use module worker in Firefox yet.
  outfile: "dist/timer.cubing.net/sw.js",
});

await new Promise((resolve) => setTimeout(resolve, 1000));

await injectManifest({
  globDirectory: "dist/timer.cubing.net/",
  globPatterns: ["**/*.{js,ico,html,png,css,ttf,txt,svg}"],
  swDest: "dist/timer.cubing.net/sw.js",
  swSrc: "dist/timer.cubing.net/sw.js",
});
