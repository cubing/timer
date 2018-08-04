import {EventName, eventOrder, eventMetadata} from "./cubing"
import {Controller} from "./timer"
import {Milliseconds} from "./timer"

// const DEFAULT_EVENT = "333";
// const STORED_EVENT_TIMEOUT_MS = 15 * 60 * 1000;

type Scramble = {
  eventName: EventName
  scrambleString: string
}

export class TimerApp {
  private scrambleView: ScrambleView;
  private statsView: StatsView;
  private domElement: HTMLElement;
  private currentEvent: EventName;
  private timerController: Controller;
  constructor() {
    this.scrambleView = new ScrambleView(this);
    this.statsView = new StatsView();
    this.domElement = <HTMLElement>document.getElementById("timer-app");

    this.enableOffline();

    // // Prevent a timer tap from scrolling the whole page on touch screens.
    this.domElement.addEventListener("touchmove", function(event)
    {
      event.preventDefault();
    });

    this.timerController = new Controller(
                                    <HTMLElement>document.getElementById("timer"),
                                    this.solveDone.bind(this),
                                    this.attemptDone.bind(this));
    // this._setRandomThemeColor();

    // this._scramblers = new Cubing.Scramblers();
    // this._shortTermSession = new ShortTermSession();
    // this._updateDisplayStats(this._shortTermSession.getTimes());

    // // This should trigger a new attempt for us.
    // this._setInitialEvent();

    // TODO: Remove:
  }

  private enableOffline() {
    const infoBar = document.getElementById("update-bar");

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then(function(r) {
        console.log(r);
        if (!r) {
          navigator.serviceWorker.register("./service-worker.js").then(function(registration) {
            console.log("Registered service worker with scope: ", registration.scope);
          }, function(err) {
            console.error(err);
          });
        } else {
          console.log("Service worker already registered.");
        }
      }, function(err) {
        console.error("Could not enable offline support.");
      });
    }
  }

//   _setInitialEvent: function() {
//     var storedEvent = localStorage["current-event"];
//     var lastAttemptDate = new Date(localStorage["last-attempt-date"]);

//     var currentDate = new Date();

//     if (storedEvent in Cubing.EventMetadata &&
//         !isNaN(lastAttemptDate) &&
//         (currentDate.getTime() - lastAttemptDate.getTime() < this.STORED_EVENT_TIMEOUT_MS)
//     ) {
//       this.setEvent(storedEvent, false);
//     } else {
//       this.setEvent(this.DEFAULT_EVENT, false);
//     }
//   },

//   _startNewAttempt: function ()
//   {
//     this._awaitedScrambleId = (typeof this._awaitedScrambleId !== "undefined") ? this._awaitedScrambleId + 1 : 0;

//     /**
//      * @param {integer} scrambledId
//      * @param {!Cubing.Scramble} scramble
//      */
//     function scrambleCallback(scrambledId, scramble)
//     {
//       if (scrambledId === this._awaitedScrambleId) {
//         this._currentScramble = scramble;
//         this._scrambleView.setScramble(this._currentScramble);
//       } else {
//         var logInfo = console.info ? console.info.bind(console) : console.log;
//         logInfo("Scramble came back out of order late (received: ", scrambledId, ", current expected: ", this._awaitedScrambleId, "):", scramble)
//       }
//     }

//     this._scrambleView.clearScramble();
//     this._scramblers.getRandomScramble(this._currentEvent, scrambleCallback.bind(this, this._awaitedScrambleId));
//   },

  setEvent(eventName: EventName, restartShortTermSession: boolean) {
    localStorage.setItem("current-event", eventName);
    this.scrambleView.setEvent(this.currentEvent);
    // this._startNewAttempt();
    // this._timerController.reset();
    // if (restartShortTermSession) {
    //   this._shortTermSession.restart();
    //   this._updateDisplayStats([]);
    // }
  }

//   _setRandomThemeColor: function()
//   {
//     var themeColors = [
//       {name: "orange", value: "#f95b2a"},
//       {name: "green", value: "#0d904f"},
//       {name: "red", value: "#ce2e20"},
//       {name: "blue", value: "#4285f4"}
//     ];
//     var randomChoice = TimerApp.Util.randomChoice(themeColors);
//     this.domElement.classList.add("theme-" + randomChoice.name);

//     document.head || (document.head = document.getElementsByTagName('head')[0]);

//     var favicon = document.createElement('link');
//     var currentFavicon = document.getElementById('favicon');
//     favicon.id = 'favicon';
//     favicon.rel = 'shortcut icon';
//     favicon.href = 'lib/favicons/favicon_' + randomChoice.name + '.ico';
//     if (currentFavicon) {
//       document.head.removeChild(currentFavicon);
//     }
//     document.head.appendChild(favicon);

//     var meta = document.createElement("meta");
//     meta.name = "theme-color";
//     meta.id = "theme-color";
//     meta.content = randomChoice.value;
//     document.head.appendChild(meta);
//   },

//   /**
//    * @param {!TimerApp.Timer.Milliseconds} time
//    */
  private solveDone(time: Milliseconds): void
  {
    // TODO
    // this._persistResult(time);
    // var times = this._shortTermSession.addTime(time);
    // this._updateDisplayStats(times);
  }

//   /**
//    * @param {!TimerApp.Timer.Milliseconds} time
//    */
//   _persistResult: function(time)
//   {
//     var today = new Date();
//     var dateString = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();

//     var serializationFormat = "v0.1";
//     var scrambleString = this._currentScramble ? this._currentScramble.scrambleString : "/* no scramble */";
//     var result = "[" + serializationFormat + "][" + this._currentEvent + "][" + new Date() + "] " + (time / 1000) + " (" + scrambleString + ")";

//     var store = (dateString in localStorage) ? localStorage[dateString] + "\n" : "";
//     localStorage[dateString] = store + result;

//     localStorage["last-attempt-date"] = today.toString();
//   },

  
//    * @param {Array<!TimerApp.Timer.Milliseconds>} times
   
  // Type: TODO
  // updateDisplayStats(times: any) {
  //   this.statsView.setStats({
  //     "avg5": Stats.prototype.formatTime(Stats.prototype.trimmedAverage(Stats.prototype.lastN(times, 5))),
  //     "avg12": .prototype.formatTime(Stats.prototype.trimmedAverage(Stats.prototype.lastN(times, 12))),
  //     "mean3": Stats.prototype.formatTime(Stats.prototype.mean(Stats.prototype.lastN(times, 3))),
  //     "best": Stats.prototype.formatTime(Stats.prototype.best(times)),
  //     "worst": Stats.prototype.formatTime(Stats.prototype.worst(times)),
  //     "numSolves": times.length
  //   });
  // }

  private attemptDone(): void {
    // TODO
    // this.startNewAttempt();
  }
}

// /**
//  * @param {!TimerApp} timerApp
//  */

class ScrambleView {
  private scrambleElement: HTMLElement;
  private eventSelectDropdown: HTMLSelectElement;
  private cubingIcon: HTMLElement;
  private scrambleText: HTMLElement;
  private optionElementsByEventName: {[s: string]: HTMLOptionElement};
  constructor(private timerApp: TimerApp) {
    this.scrambleElement = <HTMLElement>document.getElementById("scramble-bar");
    this.eventSelectDropdown = <HTMLSelectElement>document.getElementById("event-select-dropdown");
    this.cubingIcon = <HTMLElement>document.getElementById("cubing-icon");
    this.scrambleText = <HTMLAnchorElement>document.getElementById("scramble-text");

    this.eventSelectDropdown.addEventListener("change", () => {
      this.eventSelectDropdown.blur()
      this.timerApp.setEvent(this.eventSelectDropdown.value, true);
    });

    this.initializeSelectDropdown();

  }


  initializeSelectDropdown() {
    this.optionElementsByEventName = {};
    for (var eventName of eventOrder) {
      var optionElement = document.createElement("option");
      optionElement.value = eventName;
      optionElement.textContent = eventMetadata[eventName].name;

      this.optionElementsByEventName[eventName] = optionElement;
      this.eventSelectDropdown.appendChild(optionElement);
    }
  }

  setEvent(eventName: string) {
    Util.removeClassesStartingWith(this.scrambleText, "event-");
    this.scrambleText.classList.add("event-" + eventName);
    Util.removeClassesStartingWith(this.cubingIcon, "icon-");
    this.cubingIcon.classList.add("icon-" + eventName);
    if (this.eventSelectDropdown.value != eventName) {
      this.optionElementsByEventName[eventName].selected = true;
    }
    this.setScramblePlaceholder(eventName);
  }

  setScramblePlaceholder(eventName: EventName) {
    this.setScramble({
      eventName: eventName,
      scrambleString: "generating..."
    });
  }

  setScramble(scramble: Scramble) {
    this.scrambleText.classList.remove("stale");
    this.scrambleText.textContent = scramble.scrambleString;

    // TODO(lgarron): Use proper layout code. https://github.com/cubing/timer/issues/20
    if (scramble.eventName === "minx") {
      this.scrambleText.innerHTML = scramble.scrambleString;
    }
    else if (scramble.eventName === "sq1") {
      this.scrambleText.innerHTML = scramble.scrambleString.replace(/, /g, ",&nbsp;").replace(/\) \//g, ")&nbsp;/");
    }
  }

  clearScramble() {
    // this.scrambleText.href = ""; // TODO
    this.scrambleText.classList.add("stale");
  }
}

class StatsView {
  private _statsDropdown: HTMLElement; // TODO: Type
  private _elems: any; // TODO: Type
  constructor() {
    this._statsDropdown = <HTMLElement>document.getElementById("stats-dropdown");
    this._elems = {
      "avg5":       document.getElementById("avg5"),
      "avg12":      document.getElementById("avg12"),
      "mean3":      document.getElementById("mean3"),
      "best":       document.getElementById("best"),
      "worst":      document.getElementById("worst"),
      "num-solves": document.getElementById("num-solves"),
    };

    this.initializeDropdown();
  }

  initializeDropdown() {
    var storedCurrentStat = localStorage.getItem("current-stat");

    if (storedCurrentStat && storedCurrentStat in this._elems) {
      this._elems[storedCurrentStat].selected = true;
    }

    this._statsDropdown.addEventListener("change", function() {
      localStorage.setItem("current-stat", this._statsDropdown.value);
      this._statsDropdown.blur();
    }.bind(this));
  }

  // TODO: Type of stats.
  setStats(stats: any) {
    this._elems["avg5"].textContent = "avg5: " + stats.avg5;
    this._elems["avg12"].textContent = "avg12: " + stats.avg12;
    this._elems["mean3"].textContent = "mean3: " + stats.mean3;
    this._elems["best"].textContent = "best: " + stats.best;
    this._elems["worst"].textContent = "worst: " + stats.worst;
    this._elems["num-solves"].textContent = "#solves: " + stats.numSolves;
  }
}

class Util {
  static removeClassesStartingWith(element: HTMLElement, prefix: string): void {
    var classes = Array.prototype.slice.call(element.classList);
    for (var i in classes) {
      var className = classes[i];
      if (className.startsWith(prefix)) {
        element.classList.remove(className);
      }
    }
  }

  randomChoice(list: string[]): string {
    return list[Math.floor(Math.random() * list.length)];
  }
}

// window.addEventListener("load", function()
// {
//   window.timerApp = new TimerApp();
// });
