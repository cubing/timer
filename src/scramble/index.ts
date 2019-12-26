import { wrap } from "comlink";
import { EventName } from "../cubing";
import { ScrambleWorker, ScrambleWorkerConstructor } from "./worker-implementation";

const constructor = wrap(
  new Worker("./worker-implementation.ts")
) as any as ScrambleWorkerConstructor;

const instanceMain: ScrambleWorker = new constructor();
const instance444: ScrambleWorker = new constructor();

// Balances instances.
// Currently shards by event, but may get clever and track availability of workers in the future.
async function getInstanceForNewScramble(eventName: EventName): Promise<ScrambleWorker> {
  switch (eventName) {
    case "444":
      // 4x4x4 is the only "slow" scrambler, so we put it on its own thread.
      return instance444;
    default:
      return instanceMain;
  }
}

export async function randomScramble(eventName: EventName): Promise<string> {
  return await (await getInstanceForNewScramble(eventName)).getRandomScramble(eventName)
}
