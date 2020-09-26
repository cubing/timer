import "regenerator-runtime/runtime"; // Prevent `regeneratorRuntime is not defined` error. https://github.com/babel/babel/issues/5085

import { TimerDB, Session, SessionUUID } from "timer-db";
import { SessionSelect } from "./dom/SessionSelect";
import { SessionsTracker } from "./SessionsTracker";
import { StatsSummary } from "./dom/StatsSummary";

class DOMManager {
  root: HTMLElement = document.querySelector(".timer-app") as HTMLElement;
  topBar: HTMLElement = this.root.querySelector(".top-bar") as HTMLElement;
  sideBar: HTMLElement = this.root.querySelector(".side-bar") as HTMLElement;

  sessionSelect: SessionSelect;
  statsSummary: StatsSummary;
  constructor(sessionsTracker: SessionsTracker) {
    this.topBar.innerHTML = "";

    this.sessionSelect = this.topBar.appendChild(
      new SessionSelect(sessionsTracker)
    );

    this.statsSummary = new StatsSummary(sessionsTracker);
    this.sideBar.prepend(this.statsSummary); // TODO: append
    console.log(this.statsSummary);
  }
}

export class TimerApp {
  private sessionsTracker: SessionsTracker = new SessionsTracker();

  private timerDB: TimerDB = new TimerDB();
  private domManager: DOMManager = new DOMManager(this.sessionsTracker);

  constructor() {
    this.setupTimerDB();
  }

  private async setupTimerDB(): Promise<void> {
    this.timerDB.startSync({
      username: localStorage.timerDBUsername,
      password: localStorage.timerDBPassword,
    });

    let sessions = await this.timerDB.getSessions();
    let initialSession: Session;
    if (sessions.length > 0) {
      initialSession = sessions[0];
    } else {
      initialSession = await this.timerDB.createSession("3x3x3", "333", {
        stub: true,
      });
      sessions = [initialSession];
    }
    this.sessionsTracker.setSessions(sessions);
    this.sessionsTracker.setCurrentSession(initialSession);
  }
}
