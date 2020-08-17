import { randomUIntBelow } from "../vendor/cstimer/src/js/lgarron-additions-for-typescript/random-int/src";

const suffixes = ["++", "--"];

function rdPair(): string {
  return `R${suffixes[randomUIntBelow(2)]} D${suffixes[randomUIntBelow(2)]}`;
}

function randomU(): string {
  return `U${["", "'"][randomUIntBelow(2)]}`;
}

function row(): string {
  const chunks = [];
  for (let i = 0; i < 5; i++) {
    chunks.push(rdPair());
  }
  chunks.push(randomU());
  return chunks.join(" ");
}

export function getRandomScrambleMegaminx(): string {
  const chunks = [];
  for (let i = 0; i < 6; i++) {
    chunks.push(row());
  }
  return chunks.join("\n");
}

console.log(getRandomScrambleMegaminx());
