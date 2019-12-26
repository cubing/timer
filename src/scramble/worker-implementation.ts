import "babel-polyfill"; // Prevent `regeneratorRuntime is not defined` error. https://github.com/babel/babel/issues/5085

import {expose} from "comlink"
import { getRandomScramble as getRandomScramble333 } from "../vendor/cstimer/src/js/scramble/scramble_333_edit";

export interface ScrambleWorker {
  getRandomScramble333(): Promise<string>
}

export interface ScrambleWorkerConstructor {
  new(): ScrambleWorker
}

class ScrambleWorkerImpl implements ScrambleWorker {
  async getRandomScramble333(): Promise<string> {
    return getRandomScramble333();
  }
}

expose(ScrambleWorkerImpl)
