import { setSearchDebug } from "cubing/search";

setSearchDebug({ prioritizeEsbuildWorkaroundForWorkerInstantiation: true });

import "cubing/twisty";

import { Workbox } from "workbox-window";
import { TimerApp } from "./app/TimerApp";

// biome-ignore lint/suspicious/noExplicitAny: Just a quick global assignment.
(window as any).app = new TimerApp();

// TODO: Avoid trying to run for local dev?
if (location.hostname.split(".").slice(-1)[0] !== "localhost") {
  window.addEventListener("load", () => {
    const wb = new Workbox(new URL("./sw.js", import.meta.url).href);
    wb.addEventListener("waiting", (_event) => {
      wb.messageSkipWaiting();
    });
    wb.register();
  });
}
