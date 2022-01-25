// "use strict";

import { randomScramble } from "./scramble";
import { algToString } from "alg";

// TODO: Rename to `EventID`?
export type EventName =
  | "333"
  | "444"
  | "555"
  | "222"
  | "333bf"
  | "333oh"
  | "333fm"
  | "333ft"
  | "minx"
  | "pyram"
  | "sq1"
  | "clock"
  | "skewb"
  | "666"
  | "777"
  | "444bf"
  | "555bf"
  | "333mbf"
  | "fto"
  | "master_tetraminx";
export type ScrambleString = string;

// var Cubing = function() {};

// Cubing.prototype = {
//   /**
//    * Returns an empty string if unavailable.
//    * @param {!Cubing.Scramble} scramble
//    */
//   urlForScramble: function(scramble)
//   {
//     var acn_puzzle_name = Cubing.EventMetadata[scramble.eventName].acn_puzzle_name;
//     if (!acn_puzzle_name) {
//       return "";
//     }
//     var puzzle_param = (acn_puzzle_name.eventName === "3x3x3") ? "" : "puzzle=" + acn_puzzle_name + "&";

//     /**
//      * From alg.cubing.net
//      * @param {!Cubing.AlgString} algString
//      */
//     function escape_alg(algString)
//     {
//       var escaped = algString;
//       escaped = escaped.replace(/_/g, "&#95;").replace(/ /g, "_");
//       escaped = escaped.replace(/\+/g, "&#2b;");
//       escaped = escaped.replace(/-/g, "&#45;").replace(/'/g, "-");
//       return escaped;
//     }

//     // TODO(lgarron): set `scramble` parameter instead of `alg` if https://github.com/cubing/alg.cubing.net/issues/101 is implemented.
//     return "https://alg.cubing.net?" + puzzle_param + "alg=" + escape_alg(scramble.scrambleString);
//   }

// }

// // Matches the order on the WCA website.
export const eventOrder: EventName[] = [
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
];

// From cubing/scrambler-interface:
// https://github.com/cubing/scrambler-interface/blob/181a875a1/js/ui.js#L342

interface DefaultRound {
  type: string;
  num_scrambles: number;
}

interface Event {
  name: string;
  acn_puzzle_name: string | null;
  default_round: DefaultRound;
}

export const eventMetadata: { [e: string]: Event } = {
  // Official WCA events as of November 24, 2011
  "333": {
    name: "3x3x3",
    acn_puzzle_name: "3x3x3",
    default_round: { type: "avg", num_scrambles: 5 },
  },
  "444": {
    name: "4x4x4",
    acn_puzzle_name: "4x4x4",
    default_round: { type: "avg", num_scrambles: 5 },
  },
  // "555": { name: "5x5x5", acn_puzzle_name: "5x5x5", default_round: { type: "avg", num_scrambles: 5 } },
  "222": {
    name: "2x2x2",
    acn_puzzle_name: "2x2x2",
    default_round: { type: "avg", num_scrambles: 5 },
  },
  "333bf": {
    name: "3x3x3 BLD",
    acn_puzzle_name: "3x3x3",
    default_round: { type: "best", num_scrambles: 3 },
  },
  "333oh": {
    name: "3x3x3 OH",
    acn_puzzle_name: "3x3x3",
    default_round: { type: "avg", num_scrambles: 5 },
  },
  // "333fm": { name: "3x3x3 FMC", acn_puzzle_name: "3x3x3", default_round: { type: "best", num_scrambles: 1 } },
  // "333ft": { name: "3x3x3 Feet", acn_puzzle_name: "3x3x3", default_round: { type: "avg", num_scrambles: 3 } },
  // "minx": { name: "Megaminx", acn_puzzle_name: null, default_round: { type: "avg", num_scrambles: 5 } },
  pyram: {
    name: "Pyraminx",
    acn_puzzle_name: null,
    default_round: { type: "avg", num_scrambles: 5 },
  },
  sq1: {
    name: "Square-1",
    acn_puzzle_name: null,
    default_round: { type: "avg", num_scrambles: 5 },
  },
  clock: {
    name: "Clock",
    acn_puzzle_name: null,
    default_round: { type: "avg", num_scrambles: 5 },
  },
  skewb: {
    name: "Skewb",
    acn_puzzle_name: null,
    default_round: { type: "avg", num_scrambles: 5 },
  },
  // "666": { name: "6x6x6", acn_puzzle_name: "6x6x6", default_round: { type: "mean", num_scrambles: 3 } },
  // "777": { name: "7x7x7", acn_puzzle_name: "7x7x7", default_round: { type: "mean", num_scrambles: 3 } },
  // "444bf": { name: "4x4x4 BLD", acn_puzzle_name: "4x4x4", default_round: { type: "best", num_scrambles: 3 } },
  // "555bf": { name: "5x5x5 BLD", acn_puzzle_name: "5x5x5", default_round: { type: "best", num_scrambles: 3 } },
  // "333mbf": { name: "3x3x3 MBLD", acn_puzzle_name: "3x3x3", default_round: { type: "mbf", num_scrambles: 28 } }
  fto: {
    name: "FTO",
    acn_puzzle_name: null,
    default_round: { type: "avg", num_scrambles: 5 },
  },
  master_tetraminx: {
    name: "Master Tetra",
    acn_puzzle_name: null,
    default_round: { type: "avg", num_scrambles: 5 },
  },
};

// /** @typedef {string} */
// Cubing.AlgString;

// /** @typedef {!Cubing.AlgString} */
// Cubing.ScrambleString;

// /**
//  * @typedef {Object}
//  * @property {!Cubing.EventName} eventName
//  * @property {!Cubing.ScrambleString} scrambleString
//  */
// Cubing.Scramble;

export class Scramblers {
  constructor() {
    // TODO
    // this._worker = new Worker(this.WORKER_PATH);
    // this._commandId = 0;
    // this._commandIdToCallback = [];
    // this._worker.addEventListener("message", this._workerCallback.bind(this), false);
  }

  // Cubing.Scramblers.prototype = {
  //   WORKER_PATH: "lib/scramble-worker.js",

  //   /**
  //    * @param {!Object} eventName
  //    * @param {function(!Cubing.ScrambleString)} callback
  //    */
  getRandomScramble(
    eventName: EventName,
    callback: (s: ScrambleString) => void
  ) {
    randomScramble(eventName).then(callback);
    // callback("R U R'");
    // TODO
    // var commandId = this._commandScrambleId;
    // this._commandId += 1;
    // this._commandIdToCallback[commandId] = callback;
    // this._worker.postMessage({
    //   command: "getRandomScramble",
    //   commandId: commandId,
    //   eventName: eventName
    // })
  }

  //   /**
  //    * @param {!Event} e
  //    */
  //   _workerCallback: function(e)
  //   {
  //     var callback = this._commandIdToCallback[e.data.commandId];
  //     delete this._commandIdToCallback[e.data.commandId];
  //     // TODO: Handle race conditions if the first attempt is done before the
  //     // first scramble returns (possibly don't allow starting the timer without
  //     // a valid scramble?).
  //     callback(e.data.scramble)
  //   }
  // }
}
