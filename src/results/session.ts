import { AttemptData, AttemptUUID } from "./attempt";
import { UUID, newUUID } from "./uuid";
import { globalResults } from "./db";

export class Session {
  private constructor(readonly sessionData: SessionData) {
  }

  async put() {
    globalResults.put(this.sessionData);
  }

  // TODO: Make name optional and auto-generate name based on UUID?
  static async create(name: string): Promise<Session> {
    const SessionData = {
      _id: newUUID(),
      name,
      attempts: []
    }
    const session = new Session(SessionData)
    session.put();
    return session;
  }

  static async load(id: string): Promise<Session> {
    return new Session(await globalResults.get(id));
  }

  async addAttempt(attempt: AttemptData): Promise<void> {
    this.sessionData.attempts.push(attempt);
    this.put();
  }
}

/******** Types ********/

export type SessionUUID = UUID;

export interface SessionData {
  // Arbitrary user-provided name.
  name: string;
  _id: SessionUUID;
  // Attempts must be in increasing order of Unix date.
  // If the attempts are out of order, the resulting behaviour is undefined.
  attempts: AttemptData[]
  cachedStats?: SessionStats;
  // TODO: session created and modified date?
}

export interface SessionStats {
  numAttempts: number;
  best: AttemptReferenceWithTotalResult;
  worst: AttemptReferenceWithTotalResult;
  // TODO: average, means?
}

export interface AttemptReference {
  attemptUUID: AttemptUUID;
}

export interface AttemptReferenceWithTotalResult extends AttemptReference {
  totalResult: number;
}

// export interface AttemptRangeReference {
//   firstAttemptUUID: AttemptUUID;
//   lastAttemptUUID: AttemptUUID;
// }
