import "cubing/twisty";
import { TwistyAlgViewer } from "cubing/twisty";
import type { TimerAppV3 } from "../TimerAppV3";
import { TextFitter } from "./fit-text";
import { mainTwistyPlayer } from "./query";
import "./ScrambleBar.css";

export class ScrambleBar extends HTMLElement {
  textFitter = new TextFitter(this);
  algViewer: TwistyAlgViewer = this.querySelector("twisty-alg-viewer")!;
  constructor() {
    super();
    console.log("constructor", this.algViewer);
  }

  connectedCallback(): void {
    const app = this.closest("timer-app") as TimerAppV3;
    console.log("player", app.player);
    this.algViewer.twistyPlayer = mainTwistyPlayer;
    mainTwistyPlayer.experimentalModel.alg.addFreshListener(() => {
      console.log("fresh");
      this.textFitter.onResize(true);
    });
  }

  test(): void {
    console.log("test!");
  }
}

customElements.define("scramble-bar", ScrambleBar);
