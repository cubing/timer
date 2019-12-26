import { rndProb } from "../lib/mathlib";

// export * from "./scramble_temp.ts"

export function fixCase(cases, probs) {
  return cases == undefined ? rndProb(probs) : cases;
}
