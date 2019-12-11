import { UUID } from "./uuid";

type AttemptUUID = UUID;
type AlgString = string;
type EventName = string;

// Result in milliseconds
// Special values:
// -1: DNF
// -2: DNS
// -101: Replaced with extra? // TODO
type AttemptResultMs = number;

// An *attempt* starts when the competitor starts inspection and ends when they confirm the result.
// A *solve* is the portion of an attempt when the timer is running.
export interface AttemptData {
  // Globally unique, unpredictable identifier.
  // Must be unique across all attempts everywhere, ever.
  uuid: AttemptUUID;

  // Total result *including* penalties, rounded to the nearest millisecond.
  totalResultMs: AttemptResultMs;

  // Unix date of the end of the solve, in milliseconds.
  // TODO: Add a revision date?
  unixDate: number;
  event?: EventName
  scramble?: AlgString;

  // Arbitrary user-provided comment.
  // comment?: string; // TODO
  // reconstruction?: AlgString; // TODO
  // penalties?: Penalty[]; // TODO
}

export enum PenaltyReason {
  UnknownPenalty = 0,
  Unsolved = 1,
  Misalignment = 1
}

export interface Penalty {
  // Number of milliseconds that the penalty added to the result.
  // Special values:
  // -1: Resulted in a DNF.
  ms: number;
  reason?: PenaltyReason;
  beforeSolve?: boolean; // TODO
}
