import "babel-polyfill"; // Prevent `regeneratorRuntime is not defined` error. https://github.com/babel/babel/issues/5085

import { expose } from "comlink"
import { getRandomScramble as getRandomScramble222 } from "../vendor/cstimer/src/js/scramble/2x2x2";
import { getRandomScramble as getRandomScramble333 } from "../vendor/cstimer/src/js/scramble/scramble_333_edit";
import { getRandomScramble as getRandomScramble444 } from "../vendor/cstimer/src/js/scramble/scramble_444";
import { getRandomScramble as getRandomScrambleClock } from "../vendor/cstimer/src/js/scramble/clock";
import { getRandomScramble as getRandomScramblePyram } from "../vendor/cstimer/src/js/scramble/pyraminx";
import { getRandomScramble as getRandomScrambleSkewb } from "../vendor/cstimer/src/js/scramble/skewb";
import { getRandomScramble as getRandomScrambleSq1 } from "./sq1_fix";
import { EventName } from "../cubing";
import { getRandomScramble333bf, getRandomScramble444bf } from "./bf";

export interface ScrambleWorker {
  getRandomScramble(eventName: EventName): Promise<string>
}

export interface ScrambleWorkerConstructor {
  new(): ScrambleWorker
}

class ScrambleWorkerImpl implements ScrambleWorker {
  async getRandomScramble(eventName: EventName): Promise<string> {
    switch (eventName) {
      case "222":
        return getRandomScramble222();
      case "333":
      case "333oh":
      case "333ft":
        return getRandomScramble333();
      case "333bf":
        return getRandomScramble333bf();
        case "444":
          return getRandomScramble444();
          case "444bf":
            return getRandomScramble444bf();
      case "clock":
        return getRandomScrambleClock();
      case "pyram":
        return getRandomScramblePyram();
      case "skewb":
        return getRandomScrambleSkewb();
      case "sq1":
        return getRandomScrambleSq1();
      default:
        return "<scramble unavailable>";
    }
  }
}

expose(ScrambleWorkerImpl)
