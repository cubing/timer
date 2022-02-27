import "cubing/twisty";
import type { TwistyAlgViewer, TwistyPlayer } from "cubing/twisty";
import "./db";
import { TextFitter } from "./fit-text";

class TimerAppV3 {
  player = document.querySelector("twisty-player") as TwistyPlayer;
  viewer: TwistyAlgViewer = document.querySelector("twisty-alg-viewer");
  constructor() {
    console.log(this.viewer)
    this.player.alg = "F2 R2 D' R2 B2 R2 D R2 D R2 U' F' L U B2 L D' L' B L' R'";
    this.viewer.setTwistyPlayer(this.player);

    new TextFitter(document.querySelector("time-display"), {verticalRatio: 1.2});
    new TextFitter(document.querySelector("scramble-bar"));
  }
}

globalThis.timer = new TimerAppV3();
