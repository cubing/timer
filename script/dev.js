import { barelyServe } from "barely-a-dev-server";

barelyServe({
  entryRoot: "src",
  esbuildOptions: {
    external: ["crypto"],
    loader: { ".svg": "copy", ".ico": "copy" },
    banner: {
      js: "globalThis.global = globalThis; // Workaround for a `pouch-db` dep. 😕\n",
    },
  },
});
