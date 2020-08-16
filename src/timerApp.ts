import "regenerator-runtime/runtime"; // Prevent `regeneratorRuntime is not defined` error. https://github.com/babel/babel/issues/5085

console.log("111");

import { TimerDB, Session } from "timer-db";

console.log("222");
export class TimerApp {
  private timerDB: TimerDB = new TimerDB();
  private currentSession: Session | null = null;
}

console.log("Sdfsdf");
