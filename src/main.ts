import { TwistyAlgViewer, TwistyPlayer } from "cubing/twisty";
import "./db";
import { TextFitter } from "./fit-text";

class TimerAppV3 {
  player = new TwistyPlayer();
  viewer: TwistyAlgViewer = document.querySelector("twisty-alg-viewer");
  constructor() {
    this.player.alg = "R U R'";
    this.viewer.setTwistyPlayer(this.player);

    new TextFitter(document.querySelector("time-display"));
  }
}

globalThis.timer = new TimerAppV3();
