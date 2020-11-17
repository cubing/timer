import "regenerator-runtime/runtime"; // Prevent `regeneratorRuntime is not defined` error. https://github.com/babel/babel/issues/5085

import { TimerDB, Session, SessionUUID, Attempt } from "timer-db";
import { SessionSelect } from "./dom/SessionSelect";
import { SessionsTracker } from "./SessionsTracker";
import { StatsSummary } from "./dom/StatsSummary";
import { AttemptList } from "./dom/AttemptList";

class DOMManager {
  root: HTMLElement = document.querySelector(".timer-app") as HTMLElement;
  topBar: HTMLElement = this.root.querySelector(".top-bar") as HTMLElement;
  sideBar: HTMLElement = this.root.querySelector(".side-bar") as HTMLElement;

  sessionSelect: SessionSelect;
  statsSummary: StatsSummary;
  attemptList: AttemptList;
  constructor(sessionsTracker: SessionsTracker) {
    this.topBar.innerHTML = "";

    this.sessionSelect = this.topBar.appendChild(
      new SessionSelect(sessionsTracker)
    );

    this.statsSummary = new StatsSummary(sessionsTracker);
    this.attemptList = new AttemptList(sessionsTracker);
    this.sideBar.prepend(this.statsSummary); // TODO: append
    this.sideBar.appendChild(this.attemptList); // TODO: append
  }
}

export class TimerApp {
  private timerDB: TimerDB = new TimerDB();
  private sessionsTracker: SessionsTracker = new SessionsTracker(this.timerDB);
  private domManager: DOMManager = new DOMManager(this.sessionsTracker);

  constructor() {
    this.startSync();
  }

  private async startSync(): Promise<void> {
    if (localStorage.timerDBUsername) {
      this.timerDB.startSync({
        username: localStorage.timerDBUsername,
        password: localStorage.timerDBPassword,
      });
    } else {
      console.info(
        "Not syncing: could not find `localStorage.timerDBUsername`"
      );
    }
  }
}
