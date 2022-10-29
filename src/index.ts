import { TimerApp } from "./timerApp";
import "cubing/twisty";

const SW_CACHE_FILE = "./sw.js";

// if ("serviceWorker" in navigator) {
//   window.addEventListener("load", () => {
//     // Note: we can't directly specify a string inline.
//     navigator.serviceWorker.register(SW_CACHE_FILE);
//   });
// }

(window as any).app = new TimerApp();
