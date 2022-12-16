import { EventID } from "../app/events";
// import {ScrambleID} from "./scramble-worker"
import { trForAttempt } from "./results-table";
import { AttemptDataWithIDAndRev } from "../results/AttemptData";

// WebSafari (WebKit) doesn't center text in `<select>`'s `<option>` tags: https://bugs.webkit.org/show_bug.cgi?id=40216
// We detect Safari based on https://stackoverflow.com/a/23522755 so we can do an ugly workaround (manually adding padding using spaces) below.
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

type FormattedStats = {
  mean3: string;
  avg5: string;
  avg12: string;
  avg100: string;
  rate3: string;
  rate5: string;
  rate12: string;
  rate100: string;
  best: string;
  worst: string;
  numAttempts: number;
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
      mean3: <HTMLOptionElement>document.getElementById("mean3"),
      avg5: <HTMLOptionElement>document.getElementById("avg5"),
      avg12: <HTMLOptionElement>document.getElementById("avg12"),
      avg100: <HTMLOptionElement>document.getElementById("avg100"),
      rate3: <HTMLOptionElement>document.getElementById("rate3"),
      rate5: <HTMLOptionElement>document.getElementById("rate5"),
      rate12: <HTMLOptionElement>document.getElementById("rate12"),
      rate100: <HTMLOptionElement>document.getElementById("rate100"),
      best: <HTMLOptionElement>document.getElementById("best"),
      worst: <HTMLOptionElement>document.getElementById("worst"),
      "num-attempts": <HTMLOptionElement>(
        document.getElementById("num-attempts")
      ),
    };
    this.sidebarElems = {
      mean3: <HTMLOptionElement>document.getElementById("stats-current-mean3"),
      avg5: <HTMLOptionElement>document.getElementById("stats-current-avg5"),
      avg12: <HTMLOptionElement>document.getElementById("stats-current-avg12"),
      avg100: <HTMLOptionElement>(
        document.getElementById("stats-current-avg100")
      ),
      rate3: <HTMLOptionElement>document.getElementById("stats-current-rate3"),
      rate5: <HTMLOptionElement>document.getElementById("stats-current-rate5"),
      rate12: <HTMLOptionElement>(
        document.getElementById("stats-current-rate12")
      ),
      rate100: <HTMLOptionElement>(
        document.getElementById("stats-current-rate100")
      ),
      best: <HTMLOptionElement>document.getElementById("stats-best-time"),
      worst: <HTMLOptionElement>document.getElementById("stats-worst-time"),
      "num-attempts": <HTMLOptionElement>(
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
        "μ3: " + stats.mean3,
        "⌀5: " + stats.avg5,
        "⌀12: " + stats.avg12,
        "⌀100: " + stats.avg100,
        "ℏ3: " + stats.rate3,
        "ℏ5: " + stats.rate5,
        "ℏ12: " + stats.rate12,
        "ℏ100: " + stats.rate100,
        "best: " + stats.best,
        "worst: " + stats.worst,
        "count: " + stats.numAttempts,
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

    setStat(this.elems["mean3"], "μ3: " + stats.mean3);
    this.sidebarElems["mean3"].textContent = stats.mean3;
    setStat(this.elems["avg5"], "⌀5: " + stats.avg5);
    this.sidebarElems["avg5"].textContent = stats.avg5;
    setStat(this.elems["avg12"], "⌀12: " + stats.avg12);
    this.sidebarElems["avg12"].textContent = stats.avg12;
    setStat(this.elems["avg100"], "⌀100: " + stats.avg100);
    this.sidebarElems["avg100"].textContent = stats.avg100;
    setStat(this.elems["rate3"], "ℏ3: " + stats.rate3);
    this.sidebarElems["rate3"].textContent = stats.rate3;
    this.sidebarElems["rate3"].classList.toggle(
      "partial",
      stats.numAttempts < 3,
    );
    setStat(this.elems["rate5"], "ℏ5: " + stats.rate5);
    this.sidebarElems["rate5"].textContent = stats.rate5;
    this.sidebarElems["rate5"].classList.toggle(
      "partial",
      stats.numAttempts < 5,
    );
    setStat(this.elems["rate12"], "ℏ12: " + stats.rate12);
    this.sidebarElems["rate12"].textContent = stats.rate12;
    this.sidebarElems["rate12"].classList.toggle(
      "partial",
      stats.numAttempts < 12,
    );
    setStat(this.elems["rate100"], "ℏ100: " + stats.rate100);
    this.sidebarElems["rate100"].textContent = stats.rate100;
    this.sidebarElems["rate100"].classList.toggle(
      "partial",
      stats.numAttempts < 100,
    );
    setStat(this.elems["best"], "best: " + stats.best);
    this.sidebarElems["best"].textContent = stats.best;
    setStat(this.elems["worst"], "worst: " + stats.worst);
    this.sidebarElems["worst"].textContent = stats.worst;
    this.elems["num-attempts"].textContent = "count: " + stats.numAttempts;
    this.sidebarElems["num-attempts"].textContent =
      stats.numAttempts.toString();
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
