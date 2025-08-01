import { View } from "../ui/TimeView";
import * as WakeLock from "../ui/wake-lock";
import { type Milliseconds, Timer } from "./Timer";

enum State {
  ReadyDown = "ready-down",
  ReadyUp = "ready-up",
  HandOnTimer = "handOnTimer",
  Running = "running",
  Stopped = "stopped",
  Done = "done",
  Ignore = "ignore",
}

type TransitionMap = Record<State, State>;

export class Controller {
  private timer: Timer;
  // @ts-ignore: This is initialized unconditionally by the constructor but TypeScript is not powerful enough to tell.
  private state: State;
  constructor(
    private domElement: HTMLElement,
    private solveDoneCallback: (t: Milliseconds) => void,
    private startNewAttemptCallback: () => void,
  ) {
    const timerView = new View(domElement);
    this.timer = new Timer(timerView.displayTime.bind(timerView));

    document.body.addEventListener("keydown", this.keyDown.bind(this));
    document.body.addEventListener("keyup", this.keyUp.bind(this));

    // TODO: Remove?
    // FastClick.attach(domElement);

    domElement.addEventListener("touchstart", this.down.bind(this));
    domElement.addEventListener("touchend", this.up.bind(this));

    document.body.addEventListener("touchstart", this.downIfRunning.bind(this));
    document.body.addEventListener("touchend", this.upIfStopped.bind(this));

    if (navigator.maxTouchPoints > 0) {
      domElement.addEventListener("pointerdown", this.down.bind(this));
      domElement.addEventListener("pointerup", this.up.bind(this));

      document.body.addEventListener(
        "pointerdown",
        this.downIfRunning.bind(this),
      );
      document.body.addEventListener("pointerup", this.upIfStopped.bind(this));
    }

    this.setState(State.ReadyUp);
  }

  public isRunning(): boolean {
    return this.timer.isRunning();
  }

  private keyDown(e: KeyboardEvent): void {
    if (this.isTimerKey(e) || this.state === State.Running) {
      this.down();
    }
  }

  private keyUp(e: KeyboardEvent) {
    if (this.isTimerKey(e) || this.state === State.Stopped) {
      this.up();
    }
  }

  private isTimerKey(e: KeyboardEvent) {
    // Only allow spacebar for now.
    return e.which === 32;
  }

  private down() {
    const transitionMap: TransitionMap = {
      [State.ReadyDown]: State.Ignore,
      [State.ReadyUp]: State.HandOnTimer,
      [State.HandOnTimer]: State.Ignore,
      [State.Running]: State.Stopped,
      [State.Stopped]: State.Ignore,
      [State.Done]: State.ReadyDown,
      [State.Ignore]: State.Ignore,
    };
    this.setState(transitionMap[this.state]);
  }

  private up() {
    const transitionMap: TransitionMap = {
      [State.ReadyDown]: State.ReadyUp,
      [State.ReadyUp]: State.Ignore,
      [State.HandOnTimer]: State.Running,
      [State.Running]: State.Ignore,
      [State.Stopped]: State.Done,
      [State.Done]: State.Ignore,
      [State.Ignore]: State.Ignore,
    };
    this.setState(transitionMap[this.state]);
  }

  private downIfRunning(e: Event) {
    if (this.state === "running") {
      this.down();
      e.preventDefault();
    }
  }

  private upIfStopped(e: Event) {
    if (this.state === "stopped") {
      this.up();
      e.preventDefault();
    }
  }

  private clearDocumentSelection() {
    const selection = window.getSelection ? window.getSelection() : null;
    selection?.empty();
  }

  reset() {
    this.clearDocumentSelection();
    this.timer.reset();
    this.setState(State.ReadyUp);
  }

  private setState(state: State | undefined) {
    if (typeof state === "undefined") {
      throw new Error("Invalid state.");
    }
    switch (state) {
      case State.ReadyDown: {
        if (this.state === State.Done) {
          this.startNewAttemptCallback();
        }
        break;
      }
      case State.ReadyUp:
        break;
      case State.HandOnTimer: {
        this.reset();
        break;
      }
      case State.Running: {
        WakeLock.enable();
        this.timer.start();
        break;
      }
      case State.Stopped: {
        WakeLock.disable();
        const time = this.timer.stop();
        this.solveDoneCallback(time);
        break;
      }
      case State.Done: {
        break;
      }
      case State.Ignore:
        return;
      default:
        console.error("Tried to set invalid state in controller:", state);
        break;
    }
    this.domElement.classList.remove(this.state);
    this.state = state;
    this.domElement.classList.add(this.state);
  }
}
