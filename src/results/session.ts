import PouchDB from "pouchdb" // TODO: Add a wrapper so we can remove `allowSyntheticDefaultImports`.
import { AttemptData, AttemptDataWithID } from "./attempt";
import { newDateUUID } from "./uuid";

export class Session {
  public db: PouchDB.Database<AttemptData>
  constructor(name: string) {
    this.db = new PouchDB(`session_${name}`)
  }

  async addNewAttempt(data: AttemptData): Promise<PouchDB.Core.Response> {
    const dataWithId = data as AttemptDataWithID;
    dataWithId._id = newDateUUID(data.unixDate);
    console.log(dataWithId);
    return await this.db.put(dataWithId);
  }
}

/******** Types ********/

// export type SessionUUID = UUID;

// export interface SessionData {
//   // Arbitrary user-provided name.
//   name: string;
//   _id: SessionUUID;
//   // Attempts must be in increasing order of Unix date.
//   // If the attempts are out of order, the resulting behaviour is undefined.
//   attempts: AttemptData[]
//   cachedStats?: SessionStats;
//   // TODO: session created and modified date?
// }

// export interface SessionStats {
//   numAttempts: number;
//   best: AttemptReferenceWithTotalResult;
//   worst: AttemptReferenceWithTotalResult;
//   // TODO: average, means?
// }

// export interface AttemptReference {
//   attemptUUID: AttemptUUID;
// }

// export interface AttemptReferenceWithTotalResult extends AttemptReference {
//   totalResult: number;
// }

// export interface AttemptRangeReference {
//   firstAttemptUUID: AttemptUUID;
//   lastAttemptUUID: AttemptUUID;
// }
