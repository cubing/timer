
import { getRandomScramble as getRandomScramble333 } from "../vendor/cstimer/src/js/scramble/scramble_333_edit";
import { getRandomScramble as getRandomScramble444 } from "../vendor/cstimer/src/js/scramble/scramble_444";
import { rndEl } from "../vendor/cstimer/src/js/lib/mathlib";

const suffixes333Bf = [
  ["", " Rw", " Rw2", " Rw'", " Fw", " Fw'"],
  ["", " Uw", " Uw2", " Uw'"]
]

const suffixes444Bf = [
  ["", " x", " x2", " x'", " z", " z'"],
  ["", " y", " y2", " y'"]
]

export function getRandomScramble333Bf(): string {
  return getRandomScramble333() + suffixes333Bf.map(rndEl).join("");
}

export function getRandomScramble444Bf(): string {
  return getRandomScramble444() + suffixes444Bf.map(rndEl).join("");
}
