import "./TimerAppV3.css";

import { eventInfo } from "cubing/puzzles";
import { randomScrambleForEvent } from "cubing/scramble";
import "cubing/twisty";
import type { TwistyPlayer } from "cubing/twisty";
import "./db";
import "./dom/ScrambleBar";
import { type ScrambleBar } from "./dom/ScrambleBar";
import "./dom/TimeDisplay";
import { TimeDisplay } from "./dom/TimeDisplay";
import { TimerAttempt } from "./TimerAttempt";

enum ScrambleStatus {
  Pending,
  Ready,
}

export class TimerAppV3 extends HTMLElement {
  player = this.querySelector("twisty-player") as TwistyPlayer;
  scrambleBar: ScrambleBar = this.querySelector("scramble-bar");
  timeDisplay: TimeDisplay = this.querySelector("time-display");

  constructor() {
    super();
  }

  connectedCallback(): void {
    console.log(this.scrambleBar.algViewer);
    this.scrambleBar.algViewer.setTwistyPlayer(this.player);
    this.player.experimentalModel.alg.addFreshListener(() => {
      this.scrambleBar.textFitter.onResize(true);
    });

    this.setEvent("sq1");
    this.startNewAttempt();
    console.log("SDfsdf", this.timeDisplay);
    this.timeDisplay.time = 0;

    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (e.repeat) {
          return;
        }
        this.currentAttempt?.onSpaceDown();
      }
    });
    window.addEventListener("keyup", (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (e.repeat) {
          return;
        }
        this.currentAttempt?.onSpaceUp();
      }
    });
  }

  currentAttempt: TimerAttempt | null = null;
  startNewAttempt() {
    this.currentAttempt = new TimerAttempt(this, this.event);
  }

  event: string = "none";
  setEvent(event: string): void {
    if (this.event === event) {
      // No change
      return;
    }
    this.classList.remove("event-" + this.event);
    this.event = event;
    this.player.puzzle = eventInfo(event).puzzleID;
    this.scrambleStatus = ScrambleStatus.Pending;
    this.player.alg = "// Generating scramble...";
    // this.scrambleBarTextFitter.onResize();
    this.classList.add("event-" + this.event);
    this.updateScramble();
  }

  scrambleStatus: ScrambleStatus.Pending;
  async updateScramble(): Promise<void> {
    const event = this.event;
    this.player.alg = "// Generating scramble...";
    // this.scrambleBarTextFitter.onResize();
    console.log("foo!");
    const scramble = await randomScrambleForEvent(event);
    if (this.event !== event) {
      // TODO: cache?
      return;
    }
    console.log(scramble);
    this.player.alg = scramble;
    // this.scrambleBarTextFitter.onResize();
  }

  showTimeDisplay(show: boolean = true): void {
    this.classList.toggle("hide-time", !show);
  }
}

customElements.define("timer-app", TimerAppV3);
