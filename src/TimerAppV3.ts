import { eventInfo } from "cubing/puzzles";
import { randomScrambleForEvent } from "cubing/scramble";
import "cubing/twisty";
import type { TwistyAlgViewer, TwistyPlayer } from "cubing/twisty";
import "./db";
import "./dom/ScrambleBar";
import { ScrambleBar } from "./dom/ScrambleBar";
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
    this.scrambleBar.algViewer.setTwistyPlayer(this.player);

    this.setEvent("minx");
    this.startNewAttempt();
    console.log("SDfsdf", this.timeDisplay);
    this.timeDisplay.time = 0;
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

  showTime(): void {
    this.classList.add("show-time");
  }
}

customElements.define("timer-app", TimerAppV3);
