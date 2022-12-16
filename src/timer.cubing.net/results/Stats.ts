import "./db";
import { Milliseconds } from "../timing/Timer";
// function Stats() {

// };

type TimeParts = {
  secFirst: string;
  secRest: string;
  decimals: string;
};

export class Stats {
  private static compareNumbers(a: Milliseconds, b: Milliseconds) {
    return a - b;
  }

  static lastN(
    l: Milliseconds[],
    N: number,
    options?: { allowPartial: boolean },
  ): Milliseconds[] | null {
    if (l.length < N) {
      return options?.allowPartial ? l : null;
    }
    return l.slice(l.length - N);
  }

  static harmonicMean(
    l: Milliseconds[] | null,
    n: number,
  ): Milliseconds | null {
    if (l == null) {
      return null;
    }

    var total = 0;
    for (var i = 0; i < l.length - 0; i++) {
      total += 1 / l[i];
    }
    return Math.round(n / total);
  }

  static mean(l: Milliseconds[] | null): Milliseconds | null {
    if (l == null) {
      return null;
    }

    var total = 0;
    for (var i = 0; i < l.length - 0; i++) {
      total += l[i];
    }
    return Math.round(total / l.length);
  }

  /*
   * @param {Array<!TimerApp.Timer.Milliseconds>|null} l
   * @returns {Number}
   */
  static trimmedAverage(l: Milliseconds[] | null): Milliseconds | null {
    if (l == null || l.length < 3) {
      return null;
    }

    var sorted = l.sort(this.compareNumbers);
    var len = sorted.length;
    const trimFromEachEnd = Math.ceil(len / 20);

    var total = 0;
    for (var i = trimFromEachEnd; i < len - trimFromEachEnd; i++) {
      total += sorted[i];
    }
    return Math.round(total / (len - 2 * trimFromEachEnd));
  }

  static best(l: Milliseconds[] | null): Milliseconds | null {
    if (l == null || l.length === 0) {
      return null;
    }
    return Math.min.apply(this, l);
  }

  static worst(l: Milliseconds[] | null): Milliseconds | null {
    if (l == null || l.length === 0) {
      return null;
    }
    return Math.max.apply(this, l);
  }

  static timeParts(time: Milliseconds): TimeParts {
    // Each entry is [minimum number of digits if not first, separator before, value]
    var hours = Math.floor(time / (60 * 60 * 1000));
    var minutes = Math.floor(time / (60 * 1000)) % 60;
    var seconds = Math.floor(time / 1000) % 60;

    function pad(number: number, numDigitsAfterPadding: number) {
      var output = "" + number;
      while (output.length < numDigitsAfterPadding) {
        output = "0" + output;
      }
      return output;
    }

    var secFirstString = "";
    var secRestString;
    if (hours > 0) {
      secRestString =
        "" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2);
    } else if (minutes > 0) {
      secRestString = "" + minutes + ":" + pad(seconds, 2);
    } else {
      secRestString = "" + seconds;
      if (secRestString[0] === "1") {
        secFirstString = "1";
        secRestString = secRestString.substr(1);
      }
    }

    var centiseconds = Math.floor((time % 1000) / 10);

    return {
      secFirst: secFirstString,
      secRest: secRestString,
      decimals: "" + pad(centiseconds, 2),
    };
  }

  static formatTime(
    time: Milliseconds | null,
    options?: { partial: boolean },
  ): string {
    if (time === null) {
      return "—";
    }

    var parts = this.timeParts(time);
    let result = parts.secFirst + parts.secRest + "." + parts.decimals;
    if (options?.partial) {
      result = `(${result})`;
    }
    return result;
  }
}
