import { barelyServe } from "barely-a-dev-server";

barelyServe({
  dev: false,
  entryRoot: "src",
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
