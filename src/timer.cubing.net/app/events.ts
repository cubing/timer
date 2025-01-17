// "use strict";

import { eventInfo, type puzzles } from "cubing/puzzles";

export type EventID = keyof typeof puzzles;

// // Matches the order on the WCA website.
export const eventOrder: EventID[] = [
  "333",
  "222",
  "444",
  "555",
  "666",
  "777",
  "333bf",
  "333oh",
  "clock",
  "minx",
  // "333fm", "333ft", "minx",
  "pyram",
  "skewb",
  "sq1",
  // "666", "777", "444bf", "555bf", "333mbf"
  "fto",
  "master_tetraminx",
  "kilominx",
  "redi_cube",
  "baby_fto",
];

export function modifiedEventName(eventID: EventID): string {
  switch (eventID) {
    case "fto":
      return "Face-Turning Octa";
    case "baby_fto":
      return "Baby FTO";
    case "master_tetraminx":
      return "Master Tetra";
  }
  return eventInfo(eventID)?.eventName ?? "----";
}
