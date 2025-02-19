import type { Milliseconds } from "../timing/Timer";
import "./db";
// function Stats() {

// };

type TimeParts = {
  secFirst: string;
  secRest: string;
  decimals: string;
};

// biome-ignore lint/complexity/noStaticOnlyClass: This is an old code pattern.
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

    let total = 0;
    for (let i = 0; i < l.length - 0; i++) {
      total += 1 / l[i];
    }
    return Math.round(n / total);
  }

  static mean(l: Milliseconds[] | null): Milliseconds | null {
    if (l == null) {
      return null;
    }

    let total = 0;
    for (let i = 0; i < l.length - 0; i++) {
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

    const sorted = l.sort(Stats.compareNumbers);
    const len = sorted.length;
    const trimFromEachEnd = Math.ceil(len / 20);

    let total = 0;
    for (let i = trimFromEachEnd; i < len - trimFromEachEnd; i++) {
      total += sorted[i];
    }
    return Math.round(total / (len - 2 * trimFromEachEnd));
  }

  static best(l: Milliseconds[] | null): Milliseconds | null {
    if (l == null || l.length === 0) {
      return null;
    }

    return Math.min.apply(Stats, l);
  }

  static worst(l: Milliseconds[] | null): Milliseconds | null {
    if (l == null || l.length === 0) {
      return null;
    }

    return Math.max.apply(Stats, l);
  }

  static timeParts(time: Milliseconds): TimeParts {
    // Each entry is [minimum number of digits if not first, separator before, value]
    const hours = Math.floor(time / (60 * 60 * 1000));
    const minutes = Math.floor(time / (60 * 1000)) % 60;
    const seconds = Math.floor(time / 1000) % 60;

    function pad(number: number, numDigitsAfterPadding: number) {
      let output = `${number}`;
      while (output.length < numDigitsAfterPadding) {
        output = `0${output}`;
      }
      return output;
    }

    let secFirstString = "";
    let secRestString: string | undefined;
    if (hours > 0) {
      secRestString = `${hours}:${pad(minutes, 2)}:${pad(seconds, 2)}`;
    } else if (minutes > 0) {
      secRestString = `${minutes}:${pad(seconds, 2)}`;
    } else {
      secRestString = `${seconds}`;
      if (secRestString[0] === "1") {
        secFirstString = "1";
        secRestString = secRestString.substr(1);
      }
    }

    const centiseconds = Math.floor((time % 1000) / 10);

    return {
      secFirst: secFirstString,
      secRest: secRestString,
      decimals: `${pad(centiseconds, 2)}`,
    };
  }

  static formatTime(
    time: Milliseconds | null,
    options?: { partial: boolean },
  ): string {
    if (time === null) {
      return "—";
    }

    const parts = Stats.timeParts(time);
    let result = `${parts.secFirst + parts.secRest}.${parts.decimals}`;
    if (options?.partial) {
      result = `(${result})`;
    }
    return result;
  }
}
