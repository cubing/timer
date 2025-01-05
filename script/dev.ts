import { barelyServe } from "barely-a-dev-server";
import { barelyServeCommonOptions } from "./barelyServeCommonOptions";

await barelyServe({
  ...barelyServeCommonOptions,
  devDomain: "timer.localhost",
  port: 3334,
});
