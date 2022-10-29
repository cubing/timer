import { Stats } from "./stats";
import * as WakeLock from "./wake-lock";

export type Milliseconds = number;

enum State {
  ReadyDown = "ready-down",
  ReadyUp = "ready-up",
  HandOnTimer = "handOnTimer",
  Running = "running",
  Stopped = "stopped",
  Done = "done",
  Ignore = "ignore",
}

type TransitionMap = any; // TODO: Type

export class Controller {
  private timer: Timer;
  private state: State;
  constructor(
    private domElement: HTMLElement,
    private solveDoneCallback: (t: Milliseconds) => void,
    private startNewAttemptCallback: () => void,
  ) {
    var timerView = new View(domElement);
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
    var transitionMap: TransitionMap = {
      [State.ReadyDown]: State.Ignore,
      [State.ReadyUp]: State.HandOnTimer,
      [State.HandOnTimer]: State.Ignore,
      [State.Running]: State.Stopped,
      [State.Stopped]: State.Ignore,
      [State.Done]: State.ReadyDown,
    };
    this.setState(transitionMap[this.state]);
  }

  private up() {
    var transitionMap: TransitionMap = {
      [State.ReadyDown]: State.ReadyUp,
      [State.ReadyUp]: State.Ignore,
      [State.HandOnTimer]: State.Running,
      [State.Running]: State.Ignore,
      [State.Stopped]: State.Done,
      [State.Done]: State.Ignore,
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

  private setState(state: State) {
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
        var time = this.timer.stop();
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

class View {
  private secFirstElement: HTMLElement;
  private secRestElement: HTMLElement;
  private decimalDigitsElement: HTMLElement;
  constructor(domElement: HTMLElement) {
    this.secFirstElement = <HTMLElement>(
      domElement.getElementsByClassName("sec-first")[0]
    );
    this.secRestElement = <HTMLElement>(
      domElement.getElementsByClassName("sec-rest")[0]
    );
    this.decimalDigitsElement = <HTMLElement>(
      domElement.getElementsByClassName("decimal-digits")[0]
    );
  }

  displayTime(time: number) {
    var parts = Stats.timeParts(time);
    this.secFirstElement.textContent = parts.secFirst;
    this.secRestElement.textContent = parts.secRest;
    this.decimalDigitsElement.textContent = parts.decimals;
  }
}

class Timer {
  private running: boolean = false;
  private animFrameBound: () => void;
  private startTime: number;
  constructor(private currentTimeCallback: (t: Milliseconds) => void) {
    this.animFrameBound = this.animFrame.bind(this);
  }

  public isRunning(): boolean {
    return this.running;
  }

  start() {
    this.startTime = Math.floor(performance.now());
    this.currentTimeCallback(0);
    this.running = true;
    requestAnimationFrame(this.animFrameBound);
  }

  stop() {
    this.running = false;
    // cancelAnimationFrame(this.animFrameBound); // TODO: BUG
    var time = this.elapsed();
    this.currentTimeCallback(time);
    return time;
  }

  reset() {
    this.currentTimeCallback(0);
  }

  private animFrame() {
    if (!this.running) {
      return;
    }
    this.currentTimeCallback(this.elapsed());
    requestAnimationFrame(this.animFrameBound);
  }

  private elapsed() {
    return Math.floor(performance.now()) - this.startTime;
  }
}
