
import { getRandomScramble as getRandomScramble333 } from "../vendor/cstimer/src/js/scramble/scramble_333_edit";
import { rndEl } from "../vendor/cstimer/src/js/lib/mathlib";

const suffixes = [
  ["", " Rw", " Rw2", " Rw'", " Fw", " Fw'"],
  ["", " Uw", " Uw2", " Uw'"]
]

export function getRandomScramble333Bf(): string {
  return getRandomScramble333() + suffixes.map(rndEl).join("");
}
