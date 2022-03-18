import { barelyServe } from "barely-a-dev-server";

barelyServe({
  entryRoot: "src",
  port: 3456,
  esbuildOptions: {
    minify: false,
    loader: { ".ttf": "file" },
  },
});
