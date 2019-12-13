import { wrap } from "comlink"

const worker = new Worker("worker.ts");
const obj = wrap(worker) as any;

export async function randomScramble(): Promise<string> {
  await obj.inc();
  return await obj.scr;
}
