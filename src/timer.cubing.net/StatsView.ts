import { EventID } from "./events";
// import {ScrambleID} from "./scramble-worker"
import { trForAttempt } from "./results-table";
import { AttemptDataWithIDAndRev } from "./results/attempt";

// WebSafari (WebKit) doesn't center text in `<select>`'s `<option>` tags: https://bugs.webkit.org/show_bug.cgi?id=40216
// We detect Safari based on https://stackoverflow.com/a/23522755 so we can do an ugly workaround (manually adding padding using spaces) below.
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

type FormattedStats = {
  avg5: string;
  avg12: string;
  avg100: string;
  mean3: string;
  best: string;
  worst: string;
  numSolves: number;
};

export class StatsView {
  private statsDropdown: HTMLSelectElement;
  private elems: { [s: string]: HTMLOptionElement };
  private sidebarElems: { [s: string]: HTMLOptionElement };
  constructor(private getCurrentEvent: () => EventID) {
    this.statsDropdown = <HTMLSelectElement>(
      document.getElementById("stats-dropdown")
    );

    this.elems = {
      avg5: <HTMLOptionElement>document.getElementById("avg5"),
      avg12: <HTMLOptionElement>document.getElementById("avg12"),
      avg100: <HTMLOptionElement>document.getElementById("avg100"),
      mean3: <HTMLOptionElement>document.getElementById("mean3"),
      best: <HTMLOptionElement>document.getElementById("best"),
      worst: <HTMLOptionElement>document.getElementById("worst"),
      "num-solves": <HTMLOptionElement>document.getElementById("num-solves"),
    };
    this.sidebarElems = {
      avg5: <HTMLOptionElement>document.getElementById("stats-current-avg5"),
      avg12: <HTMLOptionElement>document.getElementById("stats-current-avg12"),
      avg100: <HTMLOptionElement>(
        document.getElementById("stats-current-avg100")
      ),
      mean3: <HTMLOptionElement>document.getElementById("stats-current-mean3"),
      best: <HTMLOptionElement>document.getElementById("stats-best-time"),
      worst: <HTMLOptionElement>document.getElementById("stats-worst-time"),
      "num-solves": <HTMLOptionElement>(
        document.getElementById("stats-num-times")
      ),
    };

    this.initializeDropdown();

    const syncLinks = <NodeListOf<HTMLAnchorElement>>(
      document.querySelectorAll(".sync-link")
    );
    for (const syncLink of [...syncLinks]) {
      syncLink.addEventListener("click", (e: Event) => {
        e.preventDefault();
        window.location.href = syncLink.href;
      });
    }

    const resultsLinks = <NodeListOf<HTMLAnchorElement>>(
      document.querySelectorAll(".results-link")
    );
    for (const resultsLink of [...resultsLinks]) {
      resultsLink.addEventListener("click", (e: Event) => {
        e.preventDefault();
        window.location.href = resultsLink.href;
        // Don't set event for now.
        // const url = new URL(resultsLink.href);
        // url.searchParams.set("event", getCurrentEvent())
        // window.location.href = url.toString();
      });
    }
  }

  initializeDropdown() {
    var storedCurrentStat = localStorage.getItem("current-stat");

    if (storedCurrentStat && storedCurrentStat in this.elems) {
      this.elems[storedCurrentStat].selected = true;
    }

    this.statsDropdown.addEventListener(
      "change",
      function () {
        localStorage.setItem("current-stat", this.statsDropdown.value);
        this.statsDropdown.blur();
      }.bind(this),
    );
  }

  setStats(stats: FormattedStats, attempts: AttemptDataWithIDAndRev[]) {
    const maxLen = Math.max(
      ...[
        "⌀5: " + stats.avg5,
        "⌀12: " + stats.avg12,
        "⌀100: " + stats.avg100,
        "μ3: " + stats.mean3,
        "best: " + stats.best,
        "worst: " + stats.worst,
        "#solves: " + stats.numSolves,
      ].map((s) => s.length),
    );
    function setStat(elem: HTMLOptionElement, s: string): void {
      let spacing = "";
      if (isSafari) {
        for (var i = 0; i < (maxLen - s.length) * 0.75; i++) {
          spacing += "&nbsp;";
        }
      }
      elem.innerHTML = spacing;
      elem.appendChild(document.createTextNode(s));
    }

    setStat(this.elems["avg5"], "⌀5: " + stats.avg5);
    this.sidebarElems["avg5"].textContent = stats.avg5;
    setStat(this.elems["avg12"], "⌀12: " + stats.avg12);
    this.sidebarElems["avg12"].textContent = stats.avg12;
    setStat(this.elems["avg100"], "⌀100: " + stats.avg100);
    this.sidebarElems["avg100"].textContent = stats.avg100;
    setStat(this.elems["mean3"], "μ3: " + stats.mean3);
    this.sidebarElems["mean3"].textContent = stats.mean3;
    setStat(this.elems["best"], "best: " + stats.best);
    this.sidebarElems["best"].textContent = stats.best;
    setStat(this.elems["worst"], "worst: " + stats.worst);
    this.sidebarElems["worst"].textContent = stats.worst;
    this.elems["num-solves"].textContent = "#solves: " + stats.numSolves;
    this.sidebarElems["num-solves"].textContent = stats.numSolves.toString();
    this.updateAttemptList(attempts);
  }

  updateAttemptList(attempts: AttemptDataWithIDAndRev[]): void {
    const tbody = document.querySelector("#attempt-list tbody")!;
    tbody.textContent = "";
    for (const attempt of attempts.reverse()) {
      tbody.appendChild(trForAttempt(attempt, true));
    }
  }
}
