import type { barelyServe } from "barely-a-dev-server";

export const barelyServeCommonOptions: Parameters<typeof barelyServe>[0] = {
  entryRoot: "src/timer.cubing.net",
  bundleCSS: true,
  esbuildOptions: {
    loader: {
      ".ttf": "copy",
      ".woff": "copy",
      ".woff2": "copy",
    },
    banner: {
      js: "globalThis.global = globalThis; // Workaround for a `pouch-db` dep. 😕\n",
    },
  },
};
