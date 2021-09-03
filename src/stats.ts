import { Milliseconds } from "./timer"
import "./results/db"
// function Stats() {

// };

type TimeParts = {
  secFirst: string,
  secRest: string,
  decimals: string
};

export class Stats {
  private static compareNumbers(a: Milliseconds, b: Milliseconds) {
    return a - b;
  }

  static lastN(l: Milliseconds[], N: number): Milliseconds[] | null {
    if (l.length < N) {
      return null
    }
    return l.slice(l.length - N);
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
    var seconds = Math.floor(time / (1000)) % 60;

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
      secRestString = "" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2);
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
      decimals: "" + pad(centiseconds, 2)
    };
  }

  static formatTime(time: Milliseconds | null): string {
    if (time === null) {
      return "---"
    }

    var parts = this.timeParts(time);
    return parts.secFirst + parts.secRest + "." + parts.decimals;
  }
}

const SESSION_RESUMPTION_TIMEOUT_MS: Milliseconds = 2 * 60 * 1000; // 2 min

// export class ShortTermSession {
//   private sessionInstanceId: number;
//   constructor() {
//     // TODO: Factor out ID generation.
//     this.sessionInstanceId = Math.floor(Math.random() * (4294967296 /* 2^32 */));

//     // Update the stored instance ID. This allows the first solve to be longer
//     // than SESSION_RESUMPTION_TIMEOUT_MS without starting a new session.
//     this.persistShortTermSession(this.getTimes());
//   }

//   restart(): void {
//     this.persistShortTermSession([]);
//   }

//   addTime(time: Milliseconds) {
//     // Update short-term session.
//     var times = this.getTimes();
//     times.push(time);
//     this.persistShortTermSession(times);
//     return times;
//   }

//   getTimes(): Milliseconds[] {
//     try {
//       if (!localStorage.getItem("short-term-session")) {
//         return [];
//       }

//       var session = JSON.parse(<string>localStorage.getItem("short-term-session"));
//       var timely = Math.floor(performance.now()) - session.date < SESSION_RESUMPTION_TIMEOUT_MS;
//       if (!timely && this.sessionInstanceId != session.id) {
//         return [];
//       }

//       return session.times;
//     } catch (e) {
//       return [];
//     }
//   }

//   persistShortTermSession(times: Milliseconds[]) {
//     localStorage.setItem("short-term-session", JSON.stringify({
//       "id": this.sessionInstanceId,
//       "date": Math.floor(performance.now()),
//       "times": times
//     }));
//   }
// }

// export class LongTermSession {
//   private session = new Session("default");
//   constructor() {
//   }

//   // restart(): void {
//   //   this.persistShortTermSession([]);
//   // }

//   async addTime(time: Milliseconds) {
//     console.log(await this.session.addNewAttempt({
//       totalResultMs: time,
//       unixDate: Math.floor(performance.now()),
//     }));
//   }

//   // getTimes(): Milliseconds[] {
//   //   // TODO
//   // }
// }

// async function test() {
//   const session = new Session("default");
//   console.log(await session.addNewAttempt({
//     totalResultMs: Math.floor(9000 + 3000 * Math.random()),
//     unixDate: Math.floor(performance.now()),
//   }));

//   console.log(await session.db.allDocs())
//   const attempt1 = await session.db.get((await session.db.allDocs()).rows[0].id);
//   console.log({ attempt1 });

//   const last5 = (await session.db.allDocs({
//     limit: 5,
//     descending: true,
//     include_docs: true,
//   })).rows.map((row) => row.doc!.totalResultMs);
//   console.log(last5);
//   console.log(Stats.trimmedAverage(last5));

//   console.log(await session.bestSuccess());
//   console.log(await session.worstSuccess());

//   // (window as any).globalResults = globalResults;
//   // const allDocs = (await globalResults.allDocs());
//   // const sessionId = allDocs.rows[0].id;
//   // // const session = await Session.load(sessionId);
//   // console.log(session);
//   // session.addAttempt({
//   //   uuid: newUUID(),
//   //   totalResultMs: 1234,
//   //   unixDate: Math.floor(performance.now()),
//   // })

//   // const session = await Session.create("hi");
//   // console.log(session);
//   // (window as any).session = session;
// }
