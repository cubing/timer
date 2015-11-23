
var Results = function (domElement) {
  this._domElements = {
    "num-times": document.getElementById("stats-num-times"),
    "current-avg5": document.getElementById("stats-current-avg5"),
    "current-avg12": document.getElementById("stats-current-avg12"),
    "best-avg5": document.getElementById("stats-best-avg5"),
    "best-avg12": document.getElementById("stats-best-avg12"),
    "session-avg": document.getElementById("stats-session-avg"),
    "best-time": document.getElementById("stats-best-time"),
    "worst-time": document.getElementById("stats-worst-time")
  };
  localforage.getItem("results").then(this._updateStats.bind(this));
}

Results.prototype = {
  /**
   * @param {!Results.Result} result
   */
  addResult: function(result) {
    localforage.getItem("results").then(
      (function(resultList) {
        if (resultList === null) {
          resultList = [];
        }
        resultList.push(result);
        localforage.setItem("results", resultList);
        this._updateStats(resultList);
      }).bind(this)
    );
  },

  /**
   * @param {!Results.ResultList} resultList
   */
  _updateStats: function(resultList) {
    if (!resultList) {
      return;
    }
    this._domElements["num-times"].textContent = resultList.length;
    console.log(resultList);
    this._domElements["current-avg5"].textContent = (Results.Stats.avg(resultList, resultList.length - 5, resultList.length)/1000) || "-";
  }
}

/**
 * @typedef {Object}
 * @property {!Cubing.EventName} event
 * @property {!Cubing.scrambleString} scrambleString
 * @property {!TimerApp.Timer.Milliseconds} time
 * @property {string} date
 */
Results.Result;

/**
 * @typedef {!Array<!Results.Result>}
 */
Results.ResultList;


Results.Stats = function() {}

  /**
   * @param {!Results.ResultList} resultList
   * @param {integer=} startIndex
   * @param {integer=} endIndex
   */
Results.Stats.avg = function(resultList, startIndex, endIndex) {
  startIndex = startIndex || 0;
  endIndex = endIndex || resultList.length;

  if (endIndex - startIndex < 3) {
    return null;
  }

  function compareNumbers(a, b) {
    return a - b;
  }

  var sortedSlice = resultList.slice(startIndex, endIndex).map(function(result) {
    return result.time;
  }).sort(compareNumbers);

  var trim = Math.ceil(resultList.length / 20);
  sortedSlice = sortedSlice.slice(trim, sortedSlice.length - trim);

  var totalMs = 0;
  for (var i = 0; i < sortedSlice.length; i++) {
    totalMs += sortedSlice[i];
  };
  console.log(sortedSlice);
  return Math.round(totalMs / sortedSlice.length);
}
