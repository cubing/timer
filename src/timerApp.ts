import { EventName, eventOrder, eventMetadata } from "./cubing"
import { Controller } from "./timer"
import { Milliseconds } from "./timer"
// import {ScrambleID} from "./scramble-worker"
import { Scramblers, ScrambleString } from "./cubing"
import { Stats } from "./stats"
import { Session } from "./results/session"
import { AttemptData } from "./results/attempt"

// TODO: Import this from "./scramble-worker"
export type ScrambleID = number;

const DEFAULT_EVENT = "333";
const STORED_EVENT_TIMEOUT_MS = 15 * 60 * 1000;

type Scramble = {
  eventName: EventName
  scrambleString: string
}

type FormattedStats = {
  "avg5": string
  "avg12": string
  "mean3": string
  "best": string
  "worst": string
  "numSolves": number
}

export class TimerApp {
  private scrambleView: ScrambleView;
  private statsView: StatsView;
  private domElement: HTMLElement;
  private currentEvent: EventName;
  private controller: Controller;
  private awaitedScrambleID: ScrambleID;
  private scramblers: Scramblers = new Scramblers();
  private currentScramble: Scramble;
  private session = new Session("default");
  constructor() {
    this.scrambleView = new ScrambleView(this);
    this.statsView = new StatsView();
    this.domElement = <HTMLElement>document.getElementById("timer-app");

    this.enableOffline();

    // // Prevent a timer tap from scrolling the whole page on touch screens.
    this.domElement.addEventListener("touchmove", function (event) {
      event.preventDefault();
    });

    this.controller = new Controller(
      <HTMLElement>document.getElementById("timer"),
      this.solveDone.bind(this),
      this.attemptDone.bind(this));
    this.setRandomThemeColor();

    this.getTimes().then(this.updateDisplayStats.bind(this));
    // // This should trigger a new attempt for us.
    this.setInitialEvent();
  }

  private async getTimes(): Promise<Milliseconds[]> {
    const docs: PouchDB.Core.AllDocsResponse<AttemptData> = (await this.session.db.allDocs({
      limit: 5,
      descending: true,
      include_docs: true,
    }))
    return docs.rows.map((row) => row.doc!.totalResultMs)
  }

  private enableOffline() {
    const infoBar = document.getElementById("update-bar");

    // TODO
    // if ("serviceWorker" in navigator) {
    //   navigator.serviceWorker.getRegistration().then(function(r) {
    //     console.log(r);
    //     if (!r) {
    //       navigator.serviceWorker.register("./service-worker.js").then(function(registration) {
    //         console.log("Registered service worker with scope: ", registration.scope);
    //       }, function(err) {
    //         console.error(err);
    //       });
    //     } else {
    //       console.log("Service worker already registered.");
    //     }
    //   }, function(err) {
    //     console.error("Could not enable offline support.");
    //   });
    // }
  }

  private setInitialEvent() {
    var storedEvent = localStorage.getItem("current-event");
    var lastAttemptDateStr = localStorage.getItem("last-attempt-date");

    var currentDate = new Date();

    if (storedEvent && storedEvent in eventMetadata &&
      lastAttemptDateStr &&
      (currentDate.getTime() - new Date(lastAttemptDateStr).getTime() < STORED_EVENT_TIMEOUT_MS)
    ) {
      this.setEvent(storedEvent, false);
    } else {
      this.setEvent(DEFAULT_EVENT, false);
    }
  }

  private startNewAttempt() {
    this.awaitedScrambleID = (typeof this.awaitedScrambleID !== "undefined") ? this.awaitedScrambleID + 1 : 0;

    function scrambleCallback(scrambledId: ScrambleID, scramble: ScrambleString) {
      if (scrambledId === this.awaitedScrambleID) {
        this.currentScramble = scramble;
        this.scrambleView.setScramble(this.currentScramble);
      } else {
        var logInfo = console.info ? console.info.bind(console) : console.log;
        logInfo("Scramble came back out of order late (received: ", scrambledId, ", current expected: ", this.awaitedScrambleID, "):", scramble)
      }
    }

    this.scrambleView.clearScramble();
    this.scramblers.getRandomScramble(this.currentEvent, scrambleCallback.bind(this, this.awaitedScrambleID));
  }

  setEvent(eventName: EventName, restartShortTermSession: boolean) {
    localStorage.setItem("current-event", eventName);
    this.currentEvent = eventName;
    this.scrambleView.setEvent(this.currentEvent);
    this.startNewAttempt();
    this.controller.reset();
    if (restartShortTermSession) {
      console.log("Restart not implemented");
      this.updateDisplayStats([]);
    }
  }

  private setRandomThemeColor() {
    type ThemeColor = {
      name: string
      value: string
    }
    var themeColors = [
      { name: "orange", value: "#f95b2a" },
      { name: "green", value: "#0d904f" },
      { name: "red", value: "#ce2e20" },
      { name: "blue", value: "#4285f4" }
    ];
    var randomChoice = Util.randomChoice<ThemeColor>(themeColors);
    this.domElement.classList.add("theme-" + randomChoice.name);

    // TODO: Can we remove the following line safely?
    const head = document.head || document.getElementsByTagName('head')[0];

    var favicon = document.createElement('link');
    var currentFavicon = document.getElementById('favicon');
    favicon.id = 'favicon';
    favicon.rel = 'shortcut icon';
    favicon.href = 'lib/favicons/favicon_' + randomChoice.name + '.ico';
    if (currentFavicon) {
      head.removeChild(currentFavicon);
    }
    head.appendChild(favicon);

    var meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.id = "theme-color";
    meta.content = randomChoice.value;
    head.appendChild(meta);
  }

  private async solveDone(time: Milliseconds): Promise<void> {
    await this.persistResult(time);
    await this.updateDisplayStats(await this.getTimes());
  }

  //   /**
  //    * @param {!TimerApp.Timer.Milliseconds} time
  //    */
  private async persistResult(time: Milliseconds): Promise<void> {
    await this.session.addNewAttempt({
      totalResultMs: time,
      unixDate: Date.now(),
      scramble: this.currentScramble.scrambleString
    })
  }

  updateDisplayStats(times: Milliseconds[]) {
    console.log(times);
    this.statsView.setStats({
      "avg5": Stats.formatTime(Stats.trimmedAverage(Stats.lastN(times, 5))),
      "avg12": Stats.formatTime(Stats.trimmedAverage(Stats.lastN(times, 12))),
      "mean3": Stats.formatTime(Stats.mean(Stats.lastN(times, 3))),
      "best": Stats.formatTime(Stats.best(times)),
      "worst": Stats.formatTime(Stats.worst(times)),
      "numSolves": times.length
    });
  }

  private attemptDone(): void {
    this.startNewAttempt();
  }
}

class ScrambleView {
  private scrambleElement: HTMLElement;
  private eventSelectDropdown: HTMLSelectElement;
  private cubingIcon: HTMLElement;
  private scrambleText: HTMLElement;
  private optionElementsByEventName: { [s: string]: HTMLOptionElement };
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
    if (this.eventSelectDropdown.value !== eventName) {
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
  private statsDropdown: HTMLSelectElement;
  private elems: { [s: string]: HTMLOptionElement };
  constructor() {
    this.statsDropdown = <HTMLSelectElement>document.getElementById("stats-dropdown");
    this.elems = {
      "avg5": <HTMLOptionElement>document.getElementById("avg5"),
      "avg12": <HTMLOptionElement>document.getElementById("avg12"),
      "mean3": <HTMLOptionElement>document.getElementById("mean3"),
      "best": <HTMLOptionElement>document.getElementById("best"),
      "worst": <HTMLOptionElement>document.getElementById("worst"),
      "num-solves": <HTMLOptionElement>document.getElementById("num-solves"),
    };

    this.initializeDropdown();
  }

  initializeDropdown() {
    var storedCurrentStat = localStorage.getItem("current-stat");

    if (storedCurrentStat && storedCurrentStat in this.elems) {
      this.elems[storedCurrentStat].selected = true;
    }

    this.statsDropdown.addEventListener("change", function () {
      localStorage.setItem("current-stat", this.statsDropdown.value);
      this.statsDropdown.blur();
    }.bind(this));
  }

  setStats(stats: FormattedStats) {
    this.elems["avg5"].textContent = "avg5: " + stats.avg5;
    this.elems["avg12"].textContent = "avg12: " + stats.avg12;
    this.elems["mean3"].textContent = "mean3: " + stats.mean3;
    this.elems["best"].textContent = "best: " + stats.best;
    this.elems["worst"].textContent = "worst: " + stats.worst;
    this.elems["num-solves"].textContent = "#solves: " + stats.numSolves;
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

  static randomChoice<T>(list: T[]): T {
    return list[Math.floor(Math.random() * list.length)];
  }
}
