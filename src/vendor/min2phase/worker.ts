import { expose } from "comlink"

import { initialize, solve as min2phaseSolve, randomCube } from "./min2phase.js"
import { algToString, parse } from "alg";

initialize();

const obj = {
  scr: "",
  inc() {
    this.scr = algToString(parse(min2phaseSolve(randomCube())));
  }
};

expose(obj);
