import "babel-polyfill"; // Prevent `regeneratorRuntime is not defined` error. https://github.com/babel/babel/issues/5085

import { expose } from "comlink"
import { getRandomScramble as getRandomScramble222 } from "../vendor/cstimer/src/js/scramble/2x2x2";
import { getRandomScramble as getRandomScramble333 } from "../vendor/cstimer/src/js/scramble/scramble_333_edit";
import { getRandomScramble as getRandomScramble444 } from "../vendor/cstimer/src/js/scramble/scramble_444";
import { getRandomScramble as getRandomScramblePyram } from "../vendor/cstimer/src/js/scramble/pyraminx";
import { getRandomScramble as getRandomScrambleSq1 } from "./sq1_fix";
import { EventName } from "../cubing";

export interface ScrambleWorker {
  getRandomScramble(eventName: EventName): Promise<string>
}

export interface ScrambleWorkerConstructor {
  new(): ScrambleWorker
}

class ScrambleWorkerImpl implements ScrambleWorker {
  async getRandomScramble(eventName: EventName): Promise<string> {
    console.log(eventName);
    switch (eventName) {
      case "222":
        return getRandomScramble222("222so");
      case "333":
      case "333oh":
      case "333ft":
        return getRandomScramble333();
      case "444":
        return getRandomScramble444();
      case "pyram":
        return getRandomScramblePyram();
      case "sq1":
        return getRandomScrambleSq1();
      default:
        return "<scramble unavailable>";
    }
  }
}

expose(ScrambleWorkerImpl)
