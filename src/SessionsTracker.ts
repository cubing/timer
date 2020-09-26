import { SessionUUID, Session } from "timer-db";

interface SessionsTrackerListener {
  onSessionListChange(sessions: Session[]): void;
  onCurrentSessionChange(newCurrentSession: Session): void;
}

export class SessionsTracker {
  currentSession: Session | null = null;
  sessions: Map<SessionUUID, Session> = new Map();

  listeners: Set<SessionsTrackerListener> = new Set();

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
    console.log(
      "current session",
      this.currentSession,
      this.listeners,
      session
    );
    // TODO
    // session.add({
    //   resultTotalMs: Math.floor(8000 + Math.random() * 6000),
    //   unixDate: Date.now(),
    // });
    if (this.currentSession !== session) {
      this.currentSession = session;
      for (const listener of this.listeners) {
        console.log("disp");
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
