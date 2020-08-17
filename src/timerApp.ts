import "regenerator-runtime/runtime"; // Prevent `regeneratorRuntime is not defined` error. https://github.com/babel/babel/issues/5085

import { TimerDB, Session } from "timer-db";
import { SessionSelect } from "./dom/SessionSelect";

class DOMManager {
  root: HTMLElement = document.querySelector(".timer-app") as HTMLElement;

  topBar: HTMLElement = this.root.querySelector(".top-bar") as HTMLElement;

  sessionSelect: SessionSelect = new SessionSelect();
  constructor() {
    this.topBar.innerHTML = "";
    this.topBar.appendChild(this.sessionSelect);
  }
}

export class TimerApp {
  private timerDB: TimerDB = new TimerDB();
  private domManager: DOMManager = new DOMManager();

  private currentSession: Session | null = null;

  constructor() {
    this.setupTimerDB();
  }

  private async setupTimerDB(): Promise<void> {
    const sessions = await this.timerDB.getSessions();
    this.currentSession =
      sessions[0] ?? this.timerDB.createSession("3x3x3", "333", { stub: true });
    console.log("Initial session:", this.currentSession);
  }

  setSession(session: Session): void {}
}
