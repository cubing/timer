import "regenerator-runtime/runtime"; // Prevent `regeneratorRuntime is not defined` error. https://github.com/babel/babel/issues/5085

console.log("000");

import { TimerApp } from "./timerApp";

// const SW_CACHE_FILE = "./sw.js";

// if ("serviceWorker" in navigator) {
//   window.addEventListener("load", () => {
//     // Note: we can't directly specify a string inline.
//     navigator.serviceWorker.register(SW_CACHE_FILE);
//   });
// }

console.log("aaa");
(window as any).app = new TimerApp();
console.log("bbb");
