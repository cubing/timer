import { UUID, newDateUUID } from "./uuid";

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
  // Total result *including* penalties, rounded to the nearest millisecond.
  // TODO: FMC, multi blind, BLD memo info
  totalResultMs: AttemptResultMs;

  // Unix date of the solve, in milliseconds.
  // Ideally, this date represents the end of the solve (the moment when the timer stopped).
  // TODO: Add a revision date?
  unixDate: number;
  event?: EventName
  scramble?: AlgString;

  // Arbitrary user-provided comment.
  comment?: string; // TODO
  solution?: AlgString; // TODO
  // penalties?: Penalty[]; // TODO
}

export interface AttemptDataWithID extends AttemptData {
  // Globally unique, unpredictable identifier.
  // Must be unique across all attempts everywhere, ever.
  _id: AttemptUUID;
}

// An *attempt* starts when the competitor starts inspection and ends when they confirm the result.
// A *solve* is the portion of an attempt when the timer is running.
export interface AttemptDataWithIDAndRev extends AttemptDataWithID {
  _rev: string;
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
