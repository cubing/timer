import { Alg } from "cubing/alg";
import { randomScrambleForEvent } from "cubing/scramble";
import type { TimerAppV3 } from "./TimerAppV3";

export enum TimerAttemptStatus {
  GeneratingScramble = "GeneratingScramble",
  ScrambleReady = "ScrambleReady",
  TimerReady = "TimerReady",
  TimerRunning = "TimerRunning",
  TimerStopped = "TimerStopped",
}
export class TimerAttempt {
  scramble: Promise<Alg>;
  constructor(private app: TimerAppV3, public eventID: string) {
    this.app.showTimeDisplay(false);
    (async () => {
      try {
        this.scramble = randomScrambleForEvent(eventID);
        this.onScramble(await this.scramble);
      } catch (e) {
        console.error("cannot get scramble for event???", eventID, e);
      }
    })();
  }

  #status = TimerAttemptStatus.GeneratingScramble;
  get status(): TimerAttemptStatus {
    return this.#status;
  }

  set status(newStatus: TimerAttemptStatus) {
    if (newStatus === this.#status) {
      throw new Error(
        `Tried to set the same status as before: ${this.#status}`
      );
    }
    console.log("new status", newStatus);
    this.#status = newStatus;
  }

  onScramble(scramble: Alg): void {
    console.log("scramble!", scramble);
    this.status = TimerAttemptStatus.ScrambleReady;
    console.log("aasdasd", this.app.player, this.app.player.experimentalModel);
    this.app.player.experimentalModel.alg.set(scramble);
  }

  onSpaceDown(): void {
    switch (this.status) {
      case TimerAttemptStatus.GeneratingScramble:
        // TODO: flash scramble field with message?
        throw new Error("cannot start an attempt without a scramble");
      case TimerAttemptStatus.ScrambleReady:
        this.status = TimerAttemptStatus.TimerReady;
        this.app.showTimeDisplay(true);
        return;
      case TimerAttemptStatus.TimerReady:
        // ignore
        return;
      case TimerAttemptStatus.TimerRunning:
        this.status = TimerAttemptStatus.TimerStopped;
        return;
      case TimerAttemptStatus.TimerStopped:
        this.app.startNewAttempt();
        return;
      default:
        throw new Error("unimplemented!");
    }
  }

  onSpaceUp(): void {
    switch (this.status) {
      case TimerAttemptStatus.GeneratingScramble:
        // ignore
        return;
      case TimerAttemptStatus.ScrambleReady:
        // ignore
        return;
      case TimerAttemptStatus.TimerReady:
        this.status = TimerAttemptStatus.TimerRunning;
        return;
      case TimerAttemptStatus.TimerStopped:
        // ignore
        return;
      default:
        throw new Error("unimplemented!");
    }
  }
}
