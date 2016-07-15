
function Stats() {

};

Stats.prototype = {
  _compareNumbers: function(a, b) {
    return a - b;
  },

  /*
   * @param {Array<!TimerApp.Timer.Milliseconds>} l
   * @param {Number} N
   * @returns {Array<!TimerApp.Timer.Milliseconds>|null}
  */
  lastN: function(l, N) {
    if (l.length < N) {
      return null
    }
    return l.slice(l.length - N);
  },

  /*
   * @param {Array<!TimerApp.Timer.Milliseconds>|null} l
   * @returns {Number}
   */
  mean: function(l) {
    if (l == null) {
      return null;
    }

    var total = 0;
    for (i = 0; i < l.length - 0; i++) {
      total += l[i];
    }
    return Math.round(total / l.length);
  },

  /*
   * @param {Array<!TimerApp.Timer.Milliseconds>|null} l
   * @returns {Number}
   */
  trimmedAverage: function(l) {
    if (l == null || l.length < 3) {
      return null;
    }

    var sorted = l.sort(this._compareNumbers);
    var len = sorted.length;
    trimFromEachEnd = Math.ceil(len / 20);

    var total = 0;
    for (i = trimFromEachEnd; i < len - trimFromEachEnd; i++) {
      total += sorted[i];
    }
    return Math.round(total / (len - 2 * trimFromEachEnd));
  },

  /*
   * @param {!TimerApp.Timer.Milliseconds} time
   */
  timeParts: function(time) {
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

    var centiseconds = Math.floor((time % 1000) / 10);

    return {
      secFirst: secFirstString,
      secRest: secRestString,
      decimals: "" + pad(centiseconds, 2)
    };
  },


  /*
   * @param {!TimerApp.Timer.Milliseconds|null} time
   */
  formatTime: function(time) {
    if (time === null) {
      return "---"
    }

    var parts = this.timeParts(time);
    return parts.secFirst + parts.secRest + "." + parts.decimals;
  }
}