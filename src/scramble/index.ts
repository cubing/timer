import {wrap} from "comlink"
import { ScrambleWorker, ScrambleWorkerConstructor } from "./worker-implementation";

const constructor = wrap(
  new Worker("./worker-implementation.ts")
) as any as ScrambleWorkerConstructor;

const instance: ScrambleWorker = new constructor();

export async function randomScramble(): Promise<string> {
  return await (await instance).getRandomScramble333()
}
