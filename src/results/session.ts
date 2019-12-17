import PouchDB from "pouchdb"; // TODO: Add a wrapper so we can remove `allowSyntheticDefaultImports`.
import PouchDBFind from "pouchdb-find"; // TODO: Add a wrapper so we can remove `allowSyntheticDefaultImports`.
import { AttemptData, AttemptDataWithID, AttemptDataWithIDAndRev } from "./attempt";
import { newDateUUID } from "./uuid";

PouchDB.plugin(PouchDBFind);

export function allDocsResponseToAttemptList(docs: PouchDB.Core.AllDocsResponse<AttemptData>): AttemptData[] {
  return docs.rows.filter((row) => "totalResultMs" in row.doc!).map((row) => row.doc!)
}

export function allDocsResponseToTimes(docs: PouchDB.Core.AllDocsResponse<AttemptData>): number[] {
  return allDocsResponseToAttemptList(docs).map((doc) => doc.totalResultMs)
}

export class TimerSession {
  public db: PouchDB.Database<AttemptData>
  public remoteDB: PouchDB.Database<AttemptData>
  constructor(name: string = "session") {
    this.db = new PouchDB(`session_${name}`)
    this.db.createIndex({
      index: { fields: ["totalResultMs"] }
    });
  }

  startSync(onSyncChange: (change: PouchDB.Replication.SyncResult<AttemptData>) => void): void {

    if (!localStorage.pouchDBUsername || !localStorage.pouchDBPassword) {
      console.info("No CouchDB user!")
      return;
    }

    console.log("Attempting to connect to CouchDB.")

    // TODO:
    // - Validate username/password.
    // - auth using e.g. cookies
    const url = new URL("https://couchdb.api.cubing.net/");
    url.username = localStorage.pouchDBUsername;
    url.password = localStorage.pouchDBPassword;
    url.pathname = `results-${localStorage.pouchDBUsername}`;

    this.remoteDB = new PouchDB(url.toString());
    this.db.sync(this.remoteDB, {
      live: true,
      retry: true
    }).on('change', onSyncChange).on('error', (err) => {
      console.log("sync error", err);
    }).catch((err) => {
      console.log("sync bad error", err);
    });
  }

  // Modifies the data to add the ID
  async addNewAttempt(data: AttemptData): Promise<PouchDB.Core.Response> {
    const dataWithId = data as AttemptDataWithID;
    dataWithId._id = newDateUUID(data.unixDate);
    // console.log(dataWithId);
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

  // TODO: Remove this and encourate using map/reduce or limited reads.
  async allAttempts(): Promise<AttemptData[]> {
    return allDocsResponseToAttemptList(await this.db.allDocs({
      include_docs: true
    }));
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
