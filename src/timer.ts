import {Stats} from "./results"

export type Milliseconds = number;

// var Timer = {};

// /**
//  * @param {!Element} domElement
//  * @param {function(!Timer.Timer.Milliseconds)} solveDoneCallback
//  * @param {function(!Timer.Timer.Milliseconds)} attemptDoneCallback
//  */
export class Controller {
  // TODO: Callback types
  private timer: Timer;
  constructor(private domElement: HTMLElement,
              private solveDoneCallback: (t: Milliseconds) => void,
              private attemptDoneCallback: () => void) {

  var timerView = new View(domElement);
  this.timer = new Timer(timerView.displayTime.bind(timerView));

//   document.body.addEventListener("keydown", this._keyDown.bind(this));
//   document.body.addEventListener("keyup", this._keyUp.bind(this));

//   FastClick.attach(domElement);

//   domElement.addEventListener("touchstart", this._down.bind(this));
//   domElement.addEventListener("touchend", this._up.bind(this));

//   document.body.addEventListener("touchstart", this._downIfRunning.bind(this));
//   document.body.addEventListener("touchend", this._upIfStopped.bind(this));

//   if(navigator.maxTouchPoints > 0){
//     domElement.addEventListener("pointerdown", this._down.bind(this));
//     domElement.addEventListener("pointerup", this._up.bind(this));

//     document.body.addEventListener("pointerdown", this._downIfRunning.bind(this));
//     document.body.addEventListener("pointerup", this._upIfStopped.bind(this));
//   }

//   this._setState(Timer.Controller.State.Ready);
// }
  }

// Timer.Controller.prototype = {
//   /**
//    * @param {!Event} e
//    */
//   _keyDown: function(e)
//   {
//     if (this._isTimerKey(e) || this._state === Timer.Controller.State.Running) {
//       this._down();
//     }
//   },

//   /**
//    * @param {!Event} e
//    */
//   _keyUp: function(e)
//   {
//     if (this._isTimerKey(e) || this._state === Timer.Controller.State.Stopped) {
//       this._up();
//     }
//   },

//   /**
//    * @param {!Event} e
//    */
//   _isTimerKey: function(e)
//   {
//     // Only allow spacebar for now.
//     return e.which === 32;
//   },

//   _down: function()
//   {
//     var State = Timer.Controller.State;
//     var transitionMap = {
//       "ready":       State.HandOnTimer,
//       "handOnTimer": State.Ignore,
//       "running":     State.Stopped,
//       "stopped":     State.Ignore
//     }
//     this._setState(transitionMap[this._state]);
//   },

//   _up: function(e)
//   {
//     var State = Timer.Controller.State;
//     var transitionMap = {
//       "ready":       State.Ignore,
//       "handOnTimer": State.Running,
//       "running":     State.Ignore,
//       "stopped":     State.Ready
//     }
//     this._setState(transitionMap[this._state]);
//   },

//   _downIfRunning: function(e)
//   {
//     if (this._state === "running") {
//       this._down(e);
//       e.preventDefault();
//     }
//   },

//   _upIfStopped: function(e)
//   {
//     if (this._state === "stopped") {
//       this._up(e);
//       e.preventDefault();
//     }
//   },

  reset() {
    this.timer.reset();
  }

//   /**
//    * @param {!Timer.Controller.State} state
//    */
//   _setState: function(state)
//   {
//     var State = Timer.Controller.State;
//     switch (state) {
//       case State.Ready:
//         if (this._state == State.Stopped) {
//           this._attemptDoneCallback();
//         }
//         break;
//       case State.HandOnTimer:
//         this.reset();
//         break;
//       case State.Running:
//         this._timer.start();
//         break;
//       case State.Stopped:
//         var time = this._timer.stop();
//         this._solveDoneCallback(time);
//         break;
//       case State.Ignore:
//         return;
//       default:
//         console.error("Tried to set invalid state in controller:", state);
//         break;
//     }
//     this.domElement.classList.remove(this._state);
//     this._state = state;
//     this.domElement.classList.add(this._state);
//   }
// }
}

// Timer.Controller.State = {
//   Ready: "ready",
//   HandOnTimer: "handOnTimer",
//   Running: "running",
//   Stopped: "stopped",
//   Ignore: "ignore"
// }


// /**
//  * @param {!Element} domElement
//  */
class View {
  private secFirstElement: HTMLElement;
  private secRestElement: HTMLElement;
  private decimalDigitsElement: HTMLElement;
  constructor(domElement: HTMLElement) {
    this.secFirstElement = <HTMLElement>domElement.getElementsByClassName("sec-first")[0];
    this.secRestElement = <HTMLElement>domElement.getElementsByClassName("sec-rest")[0];
    this.decimalDigitsElement = <HTMLElement>domElement.getElementsByClassName("decimal-digits")[0];
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
  };

  start()
  {
    this.startTime = Date.now();
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
    return Date.now() - this.startTime;
  }
}
