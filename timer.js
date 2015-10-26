"use strict";


var Cubing = function() {};

Cubing.prototype = {
  /**
   * @param {!Cubing.EventName} eventName
   * @param {function(!Cubing.Scramble)} callback
   */
  getNewScramble: function(eventName, scrambleId, callback)
  {
    // TODO(lgarron): change JSSS to use web workers with an async callback;
    setTimeout(function () {
      callback({
        eventName: eventName,
        scrambleString: scramblers[eventName].getRandomScramble().scramble_string
      });
    }, 100);
  },

  /**
   * Returns an empty string if unavailable.
   * @param {!Cubing.Scramble} scramble
   */
  urlForScramble: function(scramble)
  {
    var acn_puzzle_name = Cubing.EventMetadata[scramble.eventName].acn_puzzle_name;
    if (!acn_puzzle_name) {
      return "";
    }
    var puzzle_param = (acn_puzzle_name.eventName === "3x3x3") ? "" : "puzzle=" + acn_puzzle_name + "&";

    /**
     * From alg.cubing.net
     * @param {!Cubing.Scramble} scramble
     */
    function escape_alg(algString) {
      var escaped = algString;
      escaped = escaped.replace(/_/g, "&#95;").replace(/ /g, "_");
      escaped = escaped.replace(/\+/g, "&#2b;");
      escaped = escaped.replace(/-/g, "&#45;").replace(/'/g, "-");
      return escaped;
    }

    // TODO(lgarron): set `scramble` parameter instead of `alg` if https://github.com/cubing/alg.cubing.net/issues/101 is implemented.
    return "https://alg.cubing.net?" + puzzle_param + "alg=" + escape_alg(scramble.scrambleString);
  }

}

Cubing.EventName = ["222", "333", "333bf", "333fm", "333ft", "333mbf", "333oh", "444", "444bf", "555", "555bf", "666", "777", "clock", "minx", "pyram", "sq1"];

// From cubing/scrambler-interface:
// https://github.com/cubing/scrambler-interface/blob/181a875a1/js/ui.js#L342
Cubing.EventMetadata = {
  // Official WCA events as of November 24, 2011
  "333":    {name: "Rubik's Cube",     acn_puzzle_name: "3x3x3", default_round: {type: "avg", num_scrambles: 5}},
  "444":    {name: "4x4 Cube",         acn_puzzle_name: "4x4x4", default_round: {type: "avg", num_scrambles: 5}},
  "555":    {name: "5x5 Cube",         acn_puzzle_name: "5x5x5", default_round: {type: "avg", num_scrambles: 5}},
  "222":    {name: "2x2 Cube",         acn_puzzle_name: "2x2x2", default_round: {type: "avg", num_scrambles: 5}},
  "333bf":  {name: "3x3 blindfolded",  acn_puzzle_name: "3x3x3", default_round: {type: "best", num_scrambles: 3}},
  "333oh":  {name: "3x3 one-handed",   acn_puzzle_name: "3x3x3", default_round: {type: "avg", num_scrambles: 5}},
  "333fm":  {name: "3x3 fewest moves", acn_puzzle_name: "3x3x3", default_round: {type: "best", num_scrambles: 1 }},
  "333ft":  {name: "3x3 with feet",    acn_puzzle_name: "3x3x3", default_round: {type: "avg", num_scrambles: 3}},
  "minx":   {name: "Megaminx",         acn_puzzle_name: null, default_round: {type: "avg", num_scrambles: 5}},
  "pyram":  {name: "Pyraminx",         acn_puzzle_name: null, default_round: {type: "avg", num_scrambles: 5}},
  "sq1":    {name: "Square-1",         acn_puzzle_name: null, default_round: {type: "avg", num_scrambles: 5}},
  "clock":  {name: "Rubik's Clock",    acn_puzzle_name: null, default_round: {type: "avg", num_scrambles: 5}},
  "666":    {name: "6x6 Cube",         acn_puzzle_name: "6x6x6", default_round: {type: "mean", num_scrambles: 3}},
  "777":    {name: "7x7 Cube",         acn_puzzle_name: "7x7x7", default_round: {type: "mean", num_scrambles: 3}},
  "444bf":  {name: "4x4 blindfolded",  acn_puzzle_name: "4x4x4", default_round: {type: "best", num_scrambles: 3}},
  "555bf":  {name: "5x5 blindfolded",  acn_puzzle_name: "5x5x5", default_round: {type: "best", num_scrambles: 3}},
  "333mbf": {name: "3x3 multi blind",  acn_puzzle_name: "3x3x3", default_round: {type: "mbf", num_scrambles: 28}}
};

/** @typedef {string} */
Cubing.AlgString;

/** @typedef {!Cubing.AlgString} */
Cubing.ScrambleString;

/**
 * @typedef {Object}
 * @property {!Cubing.EventName} eventName
 * @property {!Cubing.ScrambleString} scrambleString
 */
Cubing.Scramble;


var TimerApp = function()
{
  this._scrambleView = new TimerApp.ScrambleView(this);
  this._timerController = new TimerApp.TimerController(document.getElementById("timer"), this._solveDone.bind(this));
  // This should trigger a new attempt for us.
  this.setEvent(this.DEFAULT_EVENT);
}

TimerApp.prototype = {
  DEFAULT_EVENT: "222", // Currently using 222 for testing on slow devices

  _startNewAttempt: function ()
  {
    this._awaitedScrambleId = (typeof this._awaitedScrambleId !== "undefined") ? this._awaitedScrambleId + 1 : 0;

    /**
     * @param {integer} scrambledId
     * @param {!Cubing.Scramble} scramble
     */
    function scrambleCallback(scrambledId, scramble) {
      if (scrambledId === this._awaitedScrambleId) {
        this._currentScramble = scramble;
        this._scrambleView.setScramble(this._currentScramble);
      } else {
        var logInfo = console.info ? console.info.bind(console) : console.log;
        logInfo("Scramble came back out of order late (received: ", scrambledId, ", current expected: ", this._awaitedScrambleId, "):", scramble)
      }
    }

    this._scrambleView.clearScramble();
    Cubing.prototype.getNewScramble(this._currentEvent, this._awaitedScrambleId, scrambleCallback.bind(this, this._awaitedScrambleId));
  },

  /**
   * @param {!Cubing.EventName} eventName
   */
  setEvent: function(eventName)
  {
    this._currentEvent = eventName;
    this._scrambleView.setEvent(this._currentEvent);
    this._startNewAttempt();
  },

  /**
   * @param {!TimerApp.Timer.Milliseconds} time
   */
  _solveDone: function(time) {
    this._persistResult(time);
    this._startNewAttempt();
  },

  /**
   * @param {!TimerApp.Timer.Milliseconds} time
   */
  _persistResult: function(time) {
    var today = new Date();
    var dateString = today.getFullYear() + "-" + today.getMonth() + "-" + today.getDate();

    var result = "[" + this._currentEvent + "][" + new Date() + "] " + (time / 1000) + " (" + this._currentScramble.scrambleString + ")";

    var store = (dateString in localStorage) ? localStorage[dateString] + "\n" : "";
    localStorage[dateString] = store + result;
  }
}

/**
 * @param {!TimerApp} timerApp
 */
TimerApp.ScrambleView = function(timerApp)
{
  this._timerApp = timerApp;

  this._scrambleElement = document.getElementById("scramble");
  this._eventSelectDropdown = document.getElementById("event-select-dropdown");
  this._cubingIcon = document.getElementById("cubing-icon");
  this._scrambleText = document.getElementById("scramble-text");

  this.setRandomBackgroundColor();

  this._eventSelectDropdown.addEventListener("change", function() {
    this._timerApp.setEvent(this._eventSelectDropdown.value);
  }.bind(this));

  this.initializeSelectDropdown();
}

TimerApp.ScrambleView.prototype = {
  initializeSelectDropdown: function()
  {
    this._eventSelectDropdown.optionElementsByEventName = {};
    for (var i in Cubing.EventName) {
      var eventName = Cubing.EventName[i];

      var optionElement = document.createElement("option");
      optionElement.value = eventName;
      optionElement.textContent = Cubing.EventMetadata[eventName].name;

      this._eventSelectDropdown.optionElementsByEventName[eventName] = optionElement;
      this._eventSelectDropdown.appendChild(optionElement);
    }
  },

  /**
   * @param {!Cubing.EventName} eventName
   */
  setEvent: function(eventName)
  {
    TimerApp.Util.removeClassesStartingWith(this._cubingIcon, "icon-");
    this._cubingIcon.classList.add("icon-" + eventName);
    if (this._eventSelectDropdown.value != eventName) {
      this._eventSelectDropdown.optionElementsByEventName[eventName].selected = true;
    }
  },

  /**
   * @param {!Cubing.ScrambleString} scramble
   */
  setScramble: function(scramble)
  {
    this._scrambleText.href = Cubing.prototype.urlForScramble(scramble);
    this._scrambleText.textContent = scramble.scrambleString;
  },

  clearScramble: function()
  {
    this._scrambleText.href = "";
    this._scrambleText.textContent = "(generating scramble...)"; //UIString
  },

  setRandomBackgroundColor: function()
  {
    var colors = [
      "#f95b2a", // orange
      "#0d904f", // green
      "#ce2e20", // red
      "#4285f4" // blue
      // "#ffb003" // yellow
    ]
    this._scrambleElement.style.backgroundColor = TimerApp.Util.randomChoice(colors);
  }
}


/**
 * @param {!Element} domElement
 * @param {function(!TimerApp.Timer.Milliseconds)} solveDoneCallback
 */
TimerApp.TimerController = function(domElement, solveDoneCallback) {
  this._timeTextElement = domElement;
  this._solveDoneCallback = solveDoneCallback;

  var timerView = new TimerApp.TimerView(domElement);
  this._timer = new TimerApp.Timer(timerView.displayTime.bind(timerView));

  document.body.addEventListener("keypress", this._keyDown.bind(this));
  document.body.addEventListener("keyup", this._keyUp.bind(this));

  FastClick.attach(domElement);

  domElement.addEventListener("touchstart", this._down.bind(this));
  domElement.addEventListener("touchend", this._up.bind(this));

  domElement.addEventListener("mousedown", this._down.bind(this));
  domElement.addEventListener("mouseup", this._up.bind(this));

  this._setState(TimerApp.TimerController.State.Ready);
}

TimerApp.TimerController.prototype = {
  /**
   * @param {!Event} e
   */
  _keyDown: function(e)
  {
    if (this._isTimerKey(e)) {
      this._down();
    }
  },

  /**
   * @param {!Event} e
   */
  _keyUp: function(e)
  {
    if (this._isTimerKey(e)) {
      this._up();
    }
  },

  /**
   * @param {!Event} e
   */
  _isTimerKey: function(e) {
    // Only allow spacebar for now.
    return e.which === 32;
  },

  _down: function()
  {
    var State = TimerApp.TimerController.State;
    var transitionMap = {
      "Ready":       State.HandOnTimer,
      "HandOnTimer": State.Ignore,
      "Running":     State.Stopped,
      "Stopped":     State.Ignore
    }
    this._setState(transitionMap[this._state]);
  },

  _up: function(e)
  {
    var State = TimerApp.TimerController.State;
    var transitionMap = {
      "Ready":       State.Ignore,
      "HandOnTimer": State.Running,
      "Running":     State.Ignore,
      "Stopped":     State.Ready
    }
    this._setState(transitionMap[this._state]);
  },

  /**
   * @param {!TimerApp.TimerController.State} state
   */
  _setState: function(state) {
    var State = TimerApp.TimerController.State;
    switch (state) {
      case State.Ready:
        break;
      case State.HandOnTimer:
        this._timer.reset();
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
    this._state = state;
  }
}

TimerApp.TimerController.State = {
  Ready: "Ready",
  HandOnTimer: "HandOnTimer",
  Running: "Running",
  Stopped: "Stopped",
  Ignore: "Ignore"
}


/**
 * @param {!Element} domElement
 */
TimerApp.TimerView = function(domElement)
{
  this._secFirstElement = domElement.getElementsByClassName("sec-first")[0];
  this._secRestElement = domElement.getElementsByClassName("sec-rest")[0];
  this._milliElement = domElement.getElementsByClassName("milli-digits")[0];
}

TimerApp.TimerView.prototype = {
  /**
   * @param {!TimerApp.Timer.Milliseconds} time
   */
  displayTime: function(time) {
    // Each entry is [minimum number of digits if not first, separator before, value]
    var hours   = Math.floor(time / (60 * 60 * 1000));
    var minutes = Math.floor(time / (     60 * 1000)) % 60;
    var seconds = Math.floor(time / (          1000)) % 60;

    /**
     * @param {integer} number
     * @param {integer} numDigitsAfterPadding
     */
    function pad(number, numDigitsAfterPadding) {
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

    var milliseconds = time % 1000;
    this._milliElement.textContent = "" + pad(milliseconds, 3);
  },
}


/**
 * @param {function(!TimerApp.Timer.Milliseconds)} currentTimeCallback
 */
TimerApp.Timer = function(currentTimeCallback) {
  this._currentTimeCallback = currentTimeCallback;
  this._running = false;

  this._animFrameBound = this._animFrame.bind(this);
};

TimerApp.Timer.prototype = {
  start: function()
  {
    this._startTime = Date.now();
    this._currentTimeCallback(0);
    this._running = true;
    requestAnimationFrame(this._animFrameBound);
  },

  /**
   * @returns {!TimerApp.Timer.Milliseconds}
   */
  stop: function()
  {
    this._running = false;
    cancelAnimationFrame(this._animFrameBound);
    var time = this._elapsed();
    this._currentTimeCallback(time);
    return time;
  },

  reset: function()
  {
    this._currentTimeCallback(0);
  },

  _animFrame: function() {
    if (!this._running) {
      return;
    }
    this._currentTimeCallback(this._elapsed());
    requestAnimationFrame(this._animFrameBound);
  },

  /**
   * @returns {TimerApp.Timer.Milliseconds}
   */
  _elapsed: function() {
    return Date.now() - this._startTime;
  }
}

// Time in milliseconds
/** @typedef {integer} */
TimerApp.Timer.Milliseconds;


TimerApp.Util = function() {};

/**
 * @param {!Element} element
 * @param {string} prefix
 */
TimerApp.Util.removeClassesStartingWith = function(element, prefix)
{
  for (var className of Array.prototype.slice.call(element.classList)) {
    if (className.startsWith(prefix)) {
      element.classList.remove(className);
    }
  }
}

/**
 * @param {Array} list
 */
TimerApp.Util.randomChoice =  function(list) {
  return list[Math.floor(Math.random() * list.length)];
}


window.addEventListener("load", function() {
  window.timerApp = new TimerApp();
});
