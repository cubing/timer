// "use strict";

import { Alg } from "cubing/alg";
import { randomScrambleForEvent } from "cubing/scramble";
import { puzzles } from "cubing/puzzles";

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

const randomScramblePrefetch: Record<string, Promise<Alg>> = {};

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
  //    * @param {!Object} eventID
  //    * @param {function(!Cubing.ScrambleString)} callback
  //    */
  getRandomScramble(eventID: EventID, callback: (s: Alg) => void) {
    let promise;
    if (eventID in randomScramblePrefetch) {
      promise = randomScramblePrefetch[eventID];
      delete randomScramblePrefetch[eventID];
    } else {
      promise = randomScrambleForEvent(eventID);
    }
    promise.then((s) => {
      randomScramblePrefetch[eventID] = randomScrambleForEvent(eventID);
      callback(s);
    });
    // callback("R U R'");
    // TODO
    // var commandId = this._commandScrambleId;
    // this._commandId += 1;
    // this._commandIdToCallback[commandId] = callback;
    // this._worker.postMessage({
    //   command: "getRandomScramble",
    //   commandId: commandId,
    //   eventID: eventID
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
