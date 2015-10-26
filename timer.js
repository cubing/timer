"use strict";


var Cubing = function() {};

Cubing.prototype = {
  /**
   * @param {!Cubing.EventName} eventName
   * @param {function(!Cubing.Scramble)} callback
   */
  getNewScramble: function(eventName, scrambleId, callback) {
    console.log("Scramble sent", eventName, scrambleId);
    // TODO(lgarron): change JSSS to use web workers with an async callback;
    setTimeout(function () {
      console.log("Scramble received", eventName, scrambleId);
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
  urlForScramble: function(scramble) {
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
  initializeSelectDropdown: function() {
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
  setEvent: function(eventName) {
    TimerApp.Util.removeClassesStartingWith(this._cubingIcon, "icon-");
    this._cubingIcon.classList.add("icon-" + eventName);
    if (this._eventSelectDropdown.value != eventName) {
      this._eventSelectDropdown.optionElementsByEventName[eventName].selected = true;
    }
  },

  /**
   * @param {!Cubing.ScrambleString} scramble
   */
  setScramble: function(scramble) {
    this._scrambleText.href = Cubing.prototype.urlForScramble(scramble);
    this._scrambleText.textContent = scramble.scrambleString;
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
