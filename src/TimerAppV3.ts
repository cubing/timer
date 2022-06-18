import "./TimerAppV3.css";

import { eventInfo } from "cubing/puzzles";
import { randomScrambleForEvent } from "cubing/scramble";
import "cubing/twisty";
import { TwistyPlayer } from "cubing/twisty";
import "./db";
import "./dom/ScrambleBar";
import { ScrambleBar } from "./dom/ScrambleBar";
import "./dom/TimeDisplay";
import { TimeDisplay } from "./dom/TimeDisplay";
import { TimerAttempt, TimerAttemptStatus } from "./TimerAttempt";
import { Alg } from "cubing/alg";
import { mainTwistyPlayer, upgraded } from "./dom/query";

enum ScrambleStatus {
  Pending,
  Ready,
}

export class TimerAppV3 extends HTMLElement {
  get player(): TwistyPlayer {
    return mainTwistyPlayer;
  }

  scrambleBar: ScrambleBar = upgraded(
    this.querySelector<ScrambleBar>("scramble-bar")!,
    ScrambleBar
  );
  timeDisplay: TimeDisplay = upgraded(
    this.querySelector("time-display")!,
    TimeDisplay
  );

  constructor() {
    super();
  }

  connectedCallback(): void {
    // console.log(
    //   this.scrambleBar,
    //   this.scrambleBar.isConnected,
    //   this.scrambleBar.algViewer
    // );
    // this.scrambleBar.test();
    // this.scrambleBar.algViewer.setTwistyPlayer(this.player);

    this.setEvent("sq1");
    this.startNewAttempt();
    this.timeDisplay.time = 0;

    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (e.repeat) {
          return;
        }
        this.currentAttempt?.onSpaceDown(e);
      }
    });
    window.addEventListener("keyup", (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (e.repeat) {
          return;
        }
        this.currentAttempt?.onSpaceUp(e);
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
    this.player.puzzle = eventInfo(event)!.puzzleID;
    this.scrambleStatus = ScrambleStatus.Pending;
    // console.log(this.player, this.player.experimentalModel);
    // this.player.alg = "// Generating scramble...";
    // this.scrambleBarTextFitter.onResize();
    this.classList.add("event-" + this.event);
    this.updateScramble();
  }

  scrambleStatus: ScrambleStatus.Pending;
  async updateScramble(): Promise<void> {
    const event = this.event;
    // this.player.alg = "// Generating scramble...";
    // this.scrambleBarTextFitter.onResize();
    const scramble = await randomScrambleForEvent(event);
    if (this.event !== event) {
      // TODO: cache?
      return;
    }
    console.log(scramble);
    this.player.experimentalModel.alg.set(scramble);
    // this.scrambleBarTextFitter.onResize();
  }

  showTime(ms: number | null): void {
    this.classList.toggle("hide-time", ms === null);
    if (ms !== null) {
      this.timeDisplay.time = ms;
    }
  }

  // TODO: do something more reactive
  // TODO: only handle current timer?
  onTimerStatus(status: TimerAttemptStatus): void {
    this.timeDisplay.onTimerStatus(status);
    this.scrambleBar.onTimerStatus(status);
  }

  flashTime(): void {
    this.timeDisplay.flash();
  }

  showScramble(eventID: string, scramble: Alg): void {
    console.log("showScramble", this.player, eventID, scramble);
    console.log(eventInfo(eventID));
    this.player.puzzle = eventInfo(eventID)!.puzzleID;
    this.player.alg = scramble;
  }
}

customElements.define("timer-app", TimerAppV3);
