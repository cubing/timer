"use strict";


var Cubing = function() {};

Cubing.prototype = {
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


Cubing.Scramblers = function() {
  this._worker = new Worker(this.WORKER_PATH);
  this._commandId = 0;
  this._commandIdToCallback = [];

  this._worker.addEventListener("message", this._workerCallback.bind(this), false);
}

Cubing.Scramblers.prototype = {
  WORKER_PATH: "lib/scramble-worker.js",

  /**
   * @param {!Object} eventName
   * @param {function(!Cubing.ScrambleString)} callback
   */
  getRandomScramble: function(eventName, callback) {
    var commandId = this._commandScrambleId;
    this._commandId += 1;
    this._commandIdToCallback[commandId] = callback;
    this._worker.postMessage({
      command: "getRandomScramble",
      commandId: commandId,
      eventName: eventName
    })
  },

  /**
   * @param {!Event} e
   */
  _workerCallback: function(e) {
    var callback = this._commandIdToCallback[e.data.commandId];
    delete this._commandIdToCallback[e.data.commandId];
    callback(e.data.scramble)
  }
}