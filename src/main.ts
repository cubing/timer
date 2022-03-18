import { eventInfo } from "cubing/puzzles";
import { randomScrambleForEvent } from "cubing/scramble";
import "cubing/twisty";
import type { TwistyAlgViewer, TwistyPlayer } from "cubing/twisty";
import "./db";
import { TextFitter } from "./fit-text";

import "./time-display";
import { TimeDisplay } from "./time-display";

enum ScrambleStatus {
  Pending,
  Ready,
}

class TimerAppV3 {
  appElem = document.querySelector("timer-app");
  player = document.querySelector("twisty-player") as TwistyPlayer;
  algViewer: TwistyAlgViewer = document.querySelector("twisty-alg-viewer");
  timeDisplay: TimeDisplay = document.querySelector("time-display");

  scrambleBarTextFitter = new TextFitter(
    document.querySelector("scramble-bar")
  );
  constructor() {
    console.log(this.algViewer);
    this.algViewer.setTwistyPlayer(this.player);

    this.timeDisplay.time = 11130;

    this.setEvent("minx");
    setTimeout(() => this.scrambleBarTextFitter.onResize(), 0);
  }

  event: string = "none";
  scrambleBar = document.querySelector("scramble-bar")!;
  setEvent(event: string): void {
    if (this.event === event) {
      // No change
      return;
    }
    this.appElem.classList.remove("event-" + this.event);
    this.event = event;
    this.player.puzzle = eventInfo(event).puzzleID;
    this.scrambleStatus = ScrambleStatus.Pending;
    this.player.alg = "// Generating scramble...";
    this.scrambleBarTextFitter.onResize();
    this.appElem.classList.add("event-" + this.event);
    this.updateScramble();
  }

  scrambleStatus: ScrambleStatus.Pending;
  async updateScramble(): Promise<void> {
    const event = this.event;
    this.player.alg = "// Generating scramble...";
    this.scrambleBarTextFitter.onResize();
    console.log("foo!");
    const scramble = await randomScrambleForEvent(event);
    if (this.event !== event) {
      // TODO: cache?
      return;
    }
    console.log(scramble);
    this.player.alg = scramble;
    this.scrambleBarTextFitter.onResize();
  }
}

globalThis.timer = new TimerAppV3();
