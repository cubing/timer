"use strict";


var Cubing = function() {};

Cubing.prototype = {
  /**
   * @param {!Cubing.EventName} eventName
   * @param {function(!Cubing.ScrambleString)} callback
   */
  getNewScramble: function(eventName, callback) {
    // TODO(lgarron): change JSSS to use web workers with an async callback;
    setTimeout(function () {
      callback(scramblers[eventName].getRandomScramble().scramble_string);
    }, 100);
  },

  /**
   * @param {!Cubing.AlgString} algString
   */
  urlForAlg: function(algString) {
    /**
     * From alg.cubing.net
     * @param {!Cubing.AlgString} algString
     */
    function escape_alg(algString) {
      var escaped = algString;
      escaped = escaped.replace(/_/g, "&#95;").replace(/ /g, "_");
      escaped = escaped.replace(/\+/g, "&#2b;");
      escaped = escaped.replace(/-/g, "&#45;").replace(/'/g, "-");
      return escaped;
    }

    // TODO(lgarron): set `scramble` parameter instead of `alg` if https://github.com/cubing/alg.cubing.net/issues/101 is implemented.
    return "https://alg.cubing.net?alg=" + escape_alg(algString);
  }

}

Cubing.EventName = ["222", "333", "333bf", "333fm", "333ft", "333mbf", "333oh", "444", "444bf", "555", "555bf", "666", "777", "clock", "lib", "minx", "pyram", "sq1"];

/** @typedef {string} */
Cubing.AlgString;

/** @typedef {!Cubing.AlgString} */
Cubing.ScrambleString;


var TimerApp = function()
{
  this._scrambleView = new TimerApp.ScrambleView(this);
  this.setEvent(this.DEFAULT_EVENT);
  this._startAttempt();
}

TimerApp.prototype = {
  DEFAULT_EVENT: "333",

  _startAttempt: function ()
  {
    /**
     * @param {!Cubing.ScrambleString} scrambleString
     */
    function scrambleCallback(scrambleString) {
      this._currentScramble = scrambleString;
      this._scrambleView.setScramble(this._currentScramble);
    }

    Cubing.prototype.getNewScramble(this._currentEvent, scrambleCallback.bind(this));
  },

  /**
   * @param {!Cubing.EventName} eventName
   */
  setEvent: function(eventName)
  {
    this._currentEvent = eventName;
    this._scrambleView.setEvent(this._currentEvent);
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
  this._scrambleLink = document.getElementById("scramble-link");

  this.setRandomBackgroundColor();

  this._eventSelectDropdown.addEventListener("change", function() {
    this._timerApp.setEvent(this._eventSelectDropdown.value);
  }.bind(this));
}

TimerApp.ScrambleView.prototype = {

  /**
   * @param {!Cubing.EventName} eventName
   */
  setEvent: function(eventName) {
    TimerApp.Util.removeClassesStartingWith(this._cubingIcon, "icon-");
    this._cubingIcon.classList.add("icon-" + eventName);
  },

  /**
   * @param {!Cubing.ScrambleString} scrambleString
   */
  setScramble: function(scrambleString) {
    this._scrambleLink.href = Cubing.prototype.urlForAlg(scrambleString);
    this._scrambleLink.textContent = scrambleString;
  },

  setRandomBackgroundColor: function() {
    var colors = [
      "#F95B2A", // orange
      "#0d904f", // green
      "#db4437", // red
      "#4285f4" // blue
      // "#ffb003" // yellow
    ]
    this._scrambleElement.style.backgroundColor = TimerApp.Util.randomChoice(colors);
  }
}


TimerApp.Util = function() {};

/**
 * @param {!Element} element
 * @param {string} prefix
 */
TimerApp.Util.removeClassesStartingWith = function(element, prefix)
{
  for (var className of Array.prototype.slice.call(element)) {
    if (className.startsWith(prefix)) {
      this.iconElement.classList.remove(className);
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
