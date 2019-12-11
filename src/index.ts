import "babel-polyfill"; // Prevent `regeneratorRuntime is not defined` error. https://github.com/babel/babel/issues/5085

import {
  TimerApp
} from "./timerApp"

new TimerApp();
