import { Alg } from "cubing/alg";
import { randomScrambleForEvent } from "cubing/scramble";
import type { TimerAppV3 } from "./TimerAppV3";

export enum TimerAttemptStatus {
  GeneratingScramble,
  ScrambleReady,
  TimerReady,
  TimerStarted,
  TimerStopped,
}
export class TimerAttempt {
  scramble: Promise<Alg>;
  constructor(private app: TimerAppV3, public eventID: string) {
    this.scramble = randomScrambleForEvent(eventID);

    this.scramble.then(() => this.onScramble());

    this.scramble.catch(() =>
      console.error("cannot get scramble for event???", eventID)
    );
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
  }

  onScramble(): void {
    this.status = TimerAttemptStatus.ScrambleReady;
  }

  onSpaceDown(): void {
    switch (this.status) {
      case TimerAttemptStatus.GeneratingScramble:
        // TODO: flash scramble field with message?
        throw new Error("cannot start an attempt without a scramble");
      case TimerAttemptStatus.ScrambleReady:
        this.status = TimerAttemptStatus.TimerReady;
        this.app.showTime();
    }
  }
}
