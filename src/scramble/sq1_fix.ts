
import { getRandomScramble as getRandomScrambleSq1 } from "../vendor/cstimer/src/js/scramble/scramble_sq1_new";

// TODO: Fix this in the source.
export function getRandomScramble(): string {
  return getRandomScrambleSq1().replace("`/`", "/");
}
