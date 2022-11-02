import { EventID } from "./events";
// import {ScrambleID} from "./scramble-worker"
import { Alg } from "cubing/alg";
import { randomScrambleForEvent } from "cubing/scramble";
import { AttemptData, AttemptDataWithIDAndRev } from "../results/attempt";
import { allDocsResponseToTimes, TimerSession } from "../results/session";
import { ScrambleView, ScrambleWithEvent } from "../ui/ScrambleView";
import { Stats } from "../results/stats";
import { StatsView } from "../ui/StatsView";
import {
  DEFAULT_EVENT,
  EVENT_PARAM_NAME,
  initialEventID,
  setURLParam,
} from "./url-params";
import { nonsecureRandomChoice } from "../ui/util";
import { Milliseconds } from "../timing/Timer";
import { Controller } from "../timing/Controller";

const favicons: { [s: string]: string } = {
  blue: new URL("../resources/favicons/favicon_blue.ico", import.meta.url).href,
  red: new URL("../resources/favicons/favicon_red.ico", import.meta.url).href,
  green: new URL("../resources/favicons/favicon_green.ico", import.meta.url).href,
  orange: new URL("../resources/favicons/favicon_orange.ico", import.meta.url).href,
};

// TODO: Import this from "./scramble-worker"
export type ScrambleID = number;

const STORED_EVENT_TIMEOUT_MS = 15 * 60 * 1000;
const LATEST_AMOUNT = 100;

export class TimerApp {
  private scrambleView: ScrambleView;
  private statsView: StatsView;
  private domElement: HTMLElement;
  private currentEvent: EventID;
  private controller: Controller;
  private awaitedScrambleID: ScrambleID;
  private currentScramble: ScrambleWithEvent;
  private session = new TimerSession();
  private remoteDB: PouchDB.Database<AttemptData>;

  private cachedBest: number | null = null;
  private cachedWorst: number | null = null;
  constructor() {
    this.session.startSync(this.onSyncChange.bind(this));

    this.scrambleView = new ScrambleView(this);
    this.statsView = new StatsView(() => this.currentEvent);
    this.domElement = <HTMLElement>document.getElementById("timer-app");

    this.enableOffline();

    this.domElement
      .querySelector(".stats")!
      .addEventListener("touchmove", this.onTouchMoveStats.bind(this));
    this.domElement.addEventListener("touchmove", this.onTouchMove.bind(this));

    this.controller = new Controller(
      <HTMLElement>document.getElementById("timer"),
      this.solveDone.bind(this),
      this.startNewAttempt.bind(this),
    );
    this.setRandomThemeColor();

    this.updateDisplayStats();
    // // This should trigger a new attempt for us.
    this.setInitialEvent();

    // importTimes(this.session);
  }

  async onSyncChange(
    change: PouchDB.Replication.SyncResult<AttemptData>,
  ): Promise<void> {
    console.log("sync change", change);
    // TODO: Calculate if the only changes were at the end.
    this.updateDisplayStats(true);
    console.log(this.domElement.querySelector(".stats a.sync-link"));
    const syncLinks = this.domElement.querySelectorAll(".stats a.sync-link");
    for (const syncLink of [...syncLinks]) {
      syncLink.classList.add("rotate");
    }
    setTimeout(() => {
      for (const syncLink of [...syncLinks]) {
        syncLink.classList.remove("rotate");
      }
    }, 500);

    // this.domElement.querySelector(".stats")!.classList.add("received-data");
    // setTimeout(() => {
    //   this.domElement.querySelector(".stats")!.classList.remove("received-data");
    // }, 750);
  }

  private async getTimes(): Promise<Milliseconds[]> {
    const docs0 = await this.session.mostRecentAttemptsForEvent(
      this.currentEvent,
      LATEST_AMOUNT,
    );
    console.log(docs0);
    const docs = await this.session.db.allDocs({
      // descending: true,
      include_docs: true,
    });
    return allDocsResponseToTimes(docs);
  }

  // Prevent a timer tap from scrolling the whole page on touch screens.
  private onTouchMove(e: Event) {
    e.preventDefault();
  }

  // Selective enable scrolling the stats element.
  private onTouchMoveStats(e: Event) {
    e.stopPropagation();
  }

  private enableOffline() {
    const infoBar = document.getElementById("update-bar");
  }

  private setInitialEvent() {
    this.setEvent(initialEventID, false);
  }

  private scrambleCallback(
    eventID: EventID,
    scrambledId: ScrambleID,
    scramble: Alg,
  ) {
    if (scrambledId === this.awaitedScrambleID) {
      this.currentScramble = { eventID, scramble };
      this.scrambleView.setScramble(this.currentScramble);
      this.scrambleView.staleScramble(false);
    } else {
      var logInfo = console.info ? console.info.bind(console) : console.log;
      logInfo(
        "Scramble came back out of order late (received: ",
        scrambledId,
        ", current expected: ",
        this.awaitedScrambleID,
        "):",
        scramble,
      );
    }
  }

  private async startNewAttempt() {
    this.awaitedScrambleID =
      typeof this.awaitedScrambleID !== "undefined"
        ? this.awaitedScrambleID + 1
        : 0;

    this.scrambleView.clearScramble();
    const { currentEvent, awaitedScrambleID } = this;
    const scramble = randomScrambleForEvent(this.currentEvent);
    this.scrambleCallback(currentEvent, awaitedScrambleID, await scramble);
  }

  setEvent(eventID: EventID, restartShortTermSession: boolean) {
    setURLParam(EVENT_PARAM_NAME, eventID, DEFAULT_EVENT);
    localStorage.setItem("current-event", eventID);
    this.currentEvent = eventID;
    this.scrambleView.setEvent(this.currentEvent);
    this.startNewAttempt();
    this.controller.reset();
    if (restartShortTermSession) {
      console.log("Restart not implemented");
      // this.updateDisplayStats([]);
    }
    this.updateDisplayStats(false);
  }

  private setRandomThemeColor() {
    type ThemeColor = {
      name: string;
      value: string;
    };
    var themeColors = [
      { name: "orange", value: "#f95b2a" },
      { name: "green", value: "#0d904f" },
      { name: "red", value: "#ce2e20" },
      { name: "blue", value: "#4285f4" },
    ];
    var randomChoice = nonsecureRandomChoice<ThemeColor>(themeColors);
    this.domElement.classList.add("theme-" + randomChoice.name);

    // TODO: Can we remove the following line safely?
    const head = document.head || document.getElementsByTagName("head")[0];

    var favicon = document.createElement("link");
    var currentFavicon = document.getElementById("favicon");
    favicon.id = "favicon";
    favicon.rel = "shortcut icon";
    favicon.href = favicons[randomChoice.name];
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
    this.scrambleView.staleScramble(true);
    await this.persistResult(time);
    await this.updateDisplayStats(true);
  }

  private async persistResult(time: Milliseconds): Promise<void> {
    const attemptData: AttemptData = {
      totalResultMs: time,
      unixDate: Date.now(),
      event: this.currentEvent,
      scramble: this.currentScramble?.scramble?.toString() ?? "",
    };
    if (localStorage.pouchDBDeviceName) {
      attemptData.device = localStorage.pouchDBDeviceName;
    }
    await this.session.addNewAttempt(attemptData);
  }

  private async latest(): Promise<AttemptDataWithIDAndRev[]> {
    return (
      await this.session.mostRecentAttemptsForEvent(
        this.currentEvent,
        LATEST_AMOUNT,
      )
    ).docs.reverse();
  }

  async updateDisplayStats(assumeAttemptAppended: boolean = false) {
    const attempts = await this.latest();
    const times = attempts.map((attempt) => attempt.totalResultMs);
    const formattedStats = {
      avg5: Stats.formatTime(Stats.trimmedAverage(Stats.lastN(times, 5))),
      avg12: Stats.formatTime(Stats.trimmedAverage(Stats.lastN(times, 12))),
      avg100: Stats.formatTime(Stats.trimmedAverage(Stats.lastN(times, 100))),
      mean3: Stats.formatTime(Stats.mean(Stats.lastN(times, 3))),
      best: times.length > 0 ? Stats.formatTime(Math.min(...times)) : "---",
      worst: times.length > 0 ? Stats.formatTime(Math.max(...times)) : "---",
      numSolves: (await this.session.db.info()).doc_count - 1, // TODO: exact number
    };
    this.statsView.setStats(formattedStats, attempts);
  }
}
