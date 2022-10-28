// "use strict";

import { eventInfo, puzzles } from "cubing/puzzles";

export type EventID = keyof typeof puzzles;

// // Matches the order on the WCA website.
export const eventOrder: EventID[] = [
  "333",
  "444",
  // "555",
  "222",
  "333bf",
  "333oh",
  // "333fm", "333ft", "minx",
  "pyram",
  "sq1",
  "clock",
  "skewb",
  // "666", "777", "444bf", "555bf", "333mbf"
  "fto",
  "master_tetraminx",
  "kilominx",
  "redi_cube",
];

export function modifiedEventName(eventID: EventID): string {
  switch (eventID) {
    case "fto":
      return "Face-Turning Octa";
    case "master_tetraminx":
      return "Master Tetra";
  }
  return eventInfo(eventID)?.eventName ?? "----";
}
