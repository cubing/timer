// "use strict";

// var Timer = {};

// /**
//  * @param {!Element} domElement
//  * @param {function(!Timer.Timer.Milliseconds)} solveDoneCallback
//  * @param {function(!Timer.Timer.Milliseconds)} attemptDoneCallback
//  */
// Timer.Controller = function(domElement, solveDoneCallback, attemptDoneCallback)
// {
//   this._domElement = domElement;
//   this._solveDoneCallback = solveDoneCallback;
//   this._attemptDoneCallback = attemptDoneCallback;

//   var timerView = new Timer.View(domElement);
//   this._timer = new Timer.Timer(timerView.displayTime.bind(timerView));

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

//   reset: function() {
//     this._timer.reset();
//   },

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
//     this._domElement.classList.remove(this._state);
//     this._state = state;
//     this._domElement.classList.add(this._state);
//   }
// }

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
// Timer.View = function(domElement)
// {
//   this._secFirstElement = domElement.getElementsByClassName("sec-first")[0];
//   this._secRestElement = domElement.getElementsByClassName("sec-rest")[0];
//   this._decimalDigitsElement = domElement.getElementsByClassName("decimal-digits")[0];
// }

// Timer.View.prototype = {
//   /**
//    * @param {!Timer.Timer.Milliseconds} time
//    */
//   displayTime: function(time)
//   {
//     var parts = Stats.prototype.timeParts(time);
//     this._secFirstElement.textContent = parts.secFirst;
//     this._secRestElement.textContent = parts.secRest;
//     this._decimalDigitsElement.textContent = parts.decimals;
//   },
// }


// /**
//  * @param {function(!Timer.Timer.Milliseconds)} currentTimeCallback
//  */
// Timer.Timer = function(currentTimeCallback)
// {
//   this._currentTimeCallback = currentTimeCallback;
//   this._running = false;

//   this._animFrameBound = this._animFrame.bind(this);
// };

// Timer.Timer.prototype = {
//   start: function()
//   {
//     this._startTime = Date.now();
//     this._currentTimeCallback(0);
//     this._running = true;
//     requestAnimationFrame(this._animFrameBound);
//   },

//   /**
//    * @returns {!Timer.Timer.Milliseconds}
//    */
//   stop: function()
//   {
//     this._running = false;
//     cancelAnimationFrame(this._animFrameBound);
//     var time = this._elapsed();
//     this._currentTimeCallback(time);
//     return time;
//   },

//   reset: function()
//   {
//     this._currentTimeCallback(0);
//   },

//   _animFrame: function()
//   {
//     if (!this._running) {
//       return;
//     }
//     this._currentTimeCallback(this._elapsed());
//     requestAnimationFrame(this._animFrameBound);
//   },

//   /**
//    * @returns {Timer.Timer.Milliseconds}
//    */
//   _elapsed: function()
//   {
//     return Date.now() - this._startTime;
//   }
// }

// // Time in milliseconds
// /** @typedef {integer} */
// Timer.Timer.Milliseconds;
