import { TimerApp } from "./app/TimerApp";
import "cubing/twisty";

import { Workbox } from "workbox-window";

const SW_CACHE_FILE = "./sw.js";

(window as any).app = new TimerApp();

// TODO: Avoid trying to run for local dev?
if (location.hostname.split(".").slice(-1)[0] !== "localhost") {
  window.addEventListener("load", () => {
    const wb = new Workbox(new URL("./sw.js", import.meta.url).href);
    wb.addEventListener("waiting", (event) => {
      wb.messageSkipWaiting();
    });
    wb.register();
  });
}
