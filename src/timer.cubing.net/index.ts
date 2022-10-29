import { TimerApp } from "./timerApp";
import "cubing/twisty";

const SW_CACHE_FILE = "./sw.js";

(window as any).app = new TimerApp();

// TODO: Avoid trying to run for local dev?
if (location.hostname.split(".").slice(-1)[0] !== "localhost") {
  window.addEventListener("load", () => {
    navigator.serviceWorker?.register("/sw.js");
  });
}
