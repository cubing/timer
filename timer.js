"use strict";

var Timer = {};

/**
 * @param {!Element} domElement
 * @param {function(!Timer.Timer.Milliseconds)} solveDoneCallback
 * @param {function(!Timer.Timer.Milliseconds)} attemptDoneCallback
 */
Timer.Controller = function(domElement, solveDoneCallback, attemptDoneCallback)
{
  this._domElement = domElement;
  this._solveDoneCallback = solveDoneCallback;
  this._attemptDoneCallback = attemptDoneCallback;

  this._view = new Timer.View(domElement);
  this._timer = new Timer.Timer(this._view.displayTime.bind(this._view));

  document.body.addEventListener("keypress", this._keyDown.bind(this));
  document.body.addEventListener("keyup", this._keyUp.bind(this));

  FastClick.attach(domElement);

  domElement.addEventListener("touchstart", this._down.bind(this));
  domElement.addEventListener("touchend", this._up.bind(this));

  if(navigator.maxTouchPoints > 0){
    domElement.addEventListener("pointerdown", this._down.bind(this));
    domElement.addEventListener("pointerup", this._up.bind(this));
  }

  this._setState(Timer.Controller.State.Ready);
}

Timer.Controller.prototype = {
  /**
   * @param {!Event} e
   */
  _keyDown: function(e)
  {
    if (this._isTimerKey(e) || this._state === Timer.Controller.State.Running) {
      this._down();
    }
  },

  /**
   * @param {!Event} e
   */
  _keyUp: function(e)
  {
    if (this._isTimerKey(e) || this._state === Timer.Controller.State.Stopped) {
      this._up();
    }
  },

  /**
   * @param {!Event} e
   */
  _isTimerKey: function(e)
  {
    // Only allow spacebar for now.
    return e.which === 32;
  },

  _down: function()
  {
    var State = Timer.Controller.State;
    var transitionMap = {
      "ready":       State.HandOnTimer,
      "handOnTimer": State.Ignore,
      "timerGreen":  State.TimerGreen,
      "running":     State.Stopped,
      "stopped":     State.Ignore
    }
    this._setState(transitionMap[this._state]);
  },

  _up: function(e)
  {
    var State = Timer.Controller.State;
    var transitionMap = {
      "ready":       State.Ignore,
      "handOnTimer": State.Ready,
      "timerGreen":  State.Running,
      "running":     State.Ignore,
      "stopped":     State.Ready
    }
    this._setState(transitionMap[this._state]);
  },

  /**
   * @param {!Timer.Controller.State} state
   */
  _setState: function(state)
  {
    var State = Timer.Controller.State;
    switch (state) {
      case State.Ready:
        if (this._state == State.Stopped) {
          this._attemptDoneCallback(time);
        } else if (this._state == State.HandOnTimer) {
          this._view.displayPreviousTime();
        }
        break;
      case State.HandOnTimer:
        this._view.displayDashes();

        var reference = {}
        this._handOnTimerReference = reference;
        setTimeout(function() {
          if (this._state === State.HandOnTimer && this._handOnTimerReference === reference) {
            this._setState(State.TimerGreen);
          }
        }.bind(this), 600);
        break;
      case State.TimerGreen:
        this._view.displayTime(0);
        break;
      case State.Running:
        this._timer.start();
        break;
      case State.Stopped:
        var time = this._timer.stop();
        this._solveDoneCallback(time);
        break;
      case State.Ignore:
        return;
      default:
        console.error("Tried to set invalid state in controller:", state);
        break;
    }
    this._domElement.classList.remove(this._state);
    this._state = state;
    this._domElement.classList.add(this._state);
  }
}

Timer.Controller.State = {
  Ready: "ready",
  HandOnTimer: "handOnTimer",
  TimerGreen: "timerGreen",
  Running: "running",
  Stopped: "stopped",
  Ignore: "ignore"
}


/**
 * @param {!Element} domElement
 */
Timer.View = function(domElement)
{
  this._domElement = domElement;
  this._secFirstElement = domElement.getElementsByClassName("sec-first")[0];
  this._secRestElement = domElement.getElementsByClassName("sec-rest")[0];
  this._decimalDigitsElement = domElement.getElementsByClassName("decimal-digits")[0];

  this._previousTime = 0;
}

Timer.View.prototype = {
  displayDashes: function() {
    this._domElement.classList.add("dashes");
    this._secFirstElement.textContent = "";
    this._secRestElement.textContent = "-";
    this._decimalDigitsElement.textContent = "--";
  },

  displayPreviousTime: function() {
    this.displayTime(this._previousTime);
  },

  /**
   * @param {!Timer.Timer.Milliseconds} time
   */
  displayTime: function(time)
  {
    this._previousTime = time;
    this._domElement.classList.remove("dashes");

    // Each entry is [minimum number of digits if not first, separator before, value]
    var hours   = Math.floor(time / (60 * 60 * 1000));
    var minutes = Math.floor(time / (     60 * 1000)) % 60;
    var seconds = Math.floor(time / (          1000)) % 60;

    /**
     * @param {integer} number
     * @param {integer} numDigitsAfterPadding
     */
    function pad(number, numDigitsAfterPadding)
    {
      var output = "" + number;
      while (output.length < numDigitsAfterPadding) {
        output = "0" + output;
      }
      return output;
    }

    var secFirstString = "";
    var secRestString;
    if (hours > 0) {
      secRestString = "" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2);
    } else if (minutes > 0) {
      secRestString = "" +                           minutes     + ":" + pad(seconds, 2);
    } else {
      secRestString = "" +                                                   seconds    ;
      if (secRestString[0] === "1") {
        secFirstString = "1";
        secRestString = secRestString.substr(1);
      }
    }
    this._secFirstElement.textContent = secFirstString;
    this._secRestElement.textContent = secRestString;

    var centiseconds = Math.floor((time % 1000) / 10);
    this._decimalDigitsElement.textContent = "" + pad(centiseconds, 2);
  },
}


/**
 * @param {function(!Timer.Timer.Milliseconds)} currentTimeCallback
 */
Timer.Timer = function(currentTimeCallback)
{
  this._currentTimeCallback = currentTimeCallback;
  this._running = false;

  this._animFrameBound = this._animFrame.bind(this);
};

Timer.Timer.prototype = {
  start: function()
  {
    this._startTime = Date.now();
    this._currentTimeCallback(0);
    this._running = true;
    requestAnimationFrame(this._animFrameBound);
  },

  /**
   * @returns {!Timer.Timer.Milliseconds}
   */
  stop: function()
  {
    this._running = false;
    cancelAnimationFrame(this._animFrameBound);
    var time = this._elapsed();
    this._currentTimeCallback(time);
    return time;
  },

  _animFrame: function()
  {
    if (!this._running) {
      return;
    }
    this._currentTimeCallback(this._elapsed());
    requestAnimationFrame(this._animFrameBound);
  },

  /**
   * @returns {Timer.Timer.Milliseconds}
   */
  _elapsed: function()
  {
    return Date.now() - this._startTime;
  }
}

// Time in milliseconds
/** @typedef {integer} */
Timer.Timer.Milliseconds;