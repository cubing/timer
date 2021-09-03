import {
  SessionUUID,
  Session,
  TimerDB,
  SessionCreationOptions,
} from "timer-db";
import { EventName } from "./old/cubing";

interface SessionsTrackerListener {
  onSessionListChange(sessions: Session[]): void;
  onCurrentSessionChange(newCurrentSession: Session): void;
}

export class SessionsTracker {
  currentSession: Session | null = null;
  sessions: Map<SessionUUID, Session> = new Map();

  listeners: Set<SessionsTrackerListener> = new Set();

  constructor(private timerDB: TimerDB) {
    this.setup();
  }

  async setup(): Promise<void> {
    let sessions = await this.timerDB.getSessions();
    let initialSession: Session;
    if (sessions.length > 0) {
      // Allow DB to hold the default.
      initialSession = sessions[0];
    } else {
      // TODO: allow customizing the default stub session.
      initialSession = await this.timerDB.createSession("3x3x3", "333", {
        stub: true,
      });
      sessions = [initialSession];
    }
    this.setSessions(sessions);
    this.setCurrentSession(initialSession);
  }

  setSessions(sessions: Session[]): void {
    this.sessions.clear();
    for (const session of sessions) {
      this.sessions.set(session._id, session);
    }
    for (const listener of this.listeners) {
      listener.onSessionListChange(sessions);
    }
  }

  setCurrentSession(session: Session): void {
    console.log({
      "current session": this.currentSession,
      listeners: this.listeners,
      "new sessions": session,
    });
    // TODO
    // session.add({
    //   resultTotalMs: Math.floor(8000 + Math.random() * 6000),
    //   unixDate: performance.now(),
    // });
    if (this.currentSession !== session) {
      this.currentSession = session;
      for (const listener of this.listeners) {
        listener.onCurrentSessionChange(session);
      }
    }
  }

  setCurrentSessionByID(sessionID: SessionUUID): void {
    const session = this.sessions.get(sessionID);
    if (session) {
      this.setCurrentSession(session);
    }
  }

  addListener(sessionsTrackerListener: SessionsTrackerListener): void {
    this.listeners.add(sessionsTrackerListener);
  }

  removeListener(sessionsTrackerListener: SessionsTrackerListener): void {
    this.listeners.delete(sessionsTrackerListener);
  }
}
