import PouchDB from "pouchdb"; // TODO: Add a wrapper so we can remove `allowSyntheticDefaultImports`.
import PouchDBFind from "pouchdb-find"; // TODO: Add a wrapper so we can remove `allowSyntheticDefaultImports`.
import { AttemptData, AttemptDataWithID, AttemptDataWithIDAndRev } from "./attempt";
import { newDateUUID } from "./uuid";

PouchDB.plugin(PouchDBFind);

export function allDocsResponseToTimes(docs: PouchDB.Core.AllDocsResponse<AttemptData>): number[] {
  return docs.rows.filter((row) => "totalResultMs" in row.doc!).map((row) => row.doc!.totalResultMs)
}

export class Session {
  public db: PouchDB.Database<AttemptData>
  constructor(name: string) {
    this.db = new PouchDB(`session_${name}`)
    this.db.createIndex({
      index: { fields: ["totalResultMs"] }
    });
  }

  // Modifies the data to add the ID
  async addNewAttempt(data: AttemptData): Promise<PouchDB.Core.Response> {
    const dataWithId = data as AttemptDataWithID;
    dataWithId._id = newDateUUID(data.unixDate);
    console.log(dataWithId);
    return await this.db.put(dataWithId);
  }

  async extremeTimes(limit: number, descending: boolean = false): Promise<AttemptDataWithIDAndRev[]> {
    return (await this.db.find({
      selector: {
        totalResultMs: { $gt: 0 }
      },
      sort: [{ "totalResultMs": descending ? "desc" : "asc" }],
      limit: 1
    })).docs;
  }

  async bestSuccess(): Promise<AttemptDataWithIDAndRev | null> {
    const list = await this.extremeTimes(1);
    if (list.length === 0) {
      return null;
    }
    return list[0];
  }

  async worstSuccess(): Promise<AttemptDataWithIDAndRev | null> {
    const list = await this.extremeTimes(1, true);
    if (list.length === 0) {
      return null;
    }
    return list[0];
  }

  // TODO: this is in reverse order!
  async mostRecentAttempts(limit: number): Promise<PouchDB.Core.AllDocsResponse<AttemptData>> {
    return (await this.db.allDocs({
      limit: limit,
      descending: true,
      include_docs: true,
    })); //.rows.map((row) => row.doc!);
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
