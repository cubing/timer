  
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
    this._domElements["current-avg5"].textContent = (Results.Stats.avg(resultList.slice(resultList.length - 5))/1000) || "-";
    this._domElements["current-avg12"].textContent = (Results.Stats.avg(resultList.slice(resultList.length - 12))/1000) || "-";
    this._domElements["session-avg"].textContent = (Results.Stats.avg(resultList)/1000) || "-";

    var bestAndWorst = Results.Stats.bestAndWorst(resultList);
    this._domElements["best-time"].textContent = (bestAndWorst.best/1000) || "-";
    this._domElements["worst-time"].textContent = (bestAndWorst.worst/1000) || "-";
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
 * @returns {!TimerApp.Timer.Milliseconds}
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

/**
 * @param {!Results.ResultList} resultList
 */
Results.Stats.bestAndWorst = function (resultList) {
  if (resultList.length === 0) {
    return null;
  }
  var best = resultList[0].time;
  var worst = resultList[0].time;
  for (var i = 0; i < resultList.length; i++) {
    if (resultList[i].time < best) {
      best = resultList[i].time
    }
    if (resultList[i].time > worst) {
      worst = resultList[i].time
    }
  }
  return {
    "best": best,
    "worst": worst
  };
}