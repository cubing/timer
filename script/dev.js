import { barelyServe } from "barely-a-dev-server";

barelyServe({
  entryRoot: "src/timer.cubing.net",
  devDomain: "timer.localhost",
  esbuildOptions: {
    external: ["crypto"],
    loader: { ".svg": "copy", ".ico": "copy" },
    banner: {
      js: "globalThis.global = globalThis; // Workaround for a `pouch-db` dep. 😕\n",
    },
    sourcemap: true,
  },
});
