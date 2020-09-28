// @ts-ignore
import statsSummaryCSSText from "bundle-text:./StatsSummary.css";
import { Session, StatSnapshot } from "timer-db";
import { SessionsTracker } from "../SessionsTracker";
import { CSSSource, ManagedCustomElement } from "./ManagedCustomElement";
import { Stats } from "../old/stats"; // TODO

const statsSummaryCSS = new CSSSource(statsSummaryCSSText);

export class StatsSummary extends ManagedCustomElement {
  private currentSession: Session | null = null;
  private onStatsSnapshotBound = this.setSnapshot.bind(this);

  private mean3TD: HTMLElement;
  private avg5TD: HTMLElement;
  private avg12TD: HTMLElement;

  constructor(private sessionsTracker: SessionsTracker) {
    super();
    this.addCSS(statsSummaryCSS);
    sessionsTracker.addListener(this);
    if (sessionsTracker.currentSession) {
      (async () => {
        const snapshot = await sessionsTracker.currentSession?.getStatSnapshot();
        if (snapshot) {
          this.setSnapshot(snapshot);
        }
      })();
    }

    const table = this.contentWrapper.appendChild(
      document.createElement("table")
    );

    const tbodyMeta = table.appendChild(document.createElement("tbody"));

    let tr = table.appendChild(document.createElement("tr"));
    let keyTD = table.appendChild(document.createElement("td"));
    keyTD.textContent = "μ 3:";
    this.mean3TD = table.appendChild(document.createElement("td"));
    this.mean3TD.textContent = "—";

    tr = table.appendChild(document.createElement("tr"));
    keyTD = table.appendChild(document.createElement("td"));
    keyTD.textContent = "⌀ 5:";
    this.avg5TD = table.appendChild(document.createElement("td"));
    this.avg5TD.textContent = "—";

    tr = table.appendChild(document.createElement("tr"));
    keyTD = table.appendChild(document.createElement("td"));
    keyTD.textContent = "⌀ 12:";
    this.avg12TD = table.appendChild(document.createElement("td"));
    this.avg12TD.textContent = "—";
  }

  // TODO
  async onSessionListChange(_sessions: Session[]): Promise<void> {}

  async onCurrentSessionChange(newCurrentSession: Session): Promise<void> {
    if (this.currentSession) {
      this.currentSession.removeStatListener(this.onStatsSnapshotBound);
    }

    this.currentSession = newCurrentSession;
    this.currentSession.addStatListener(this.onStatsSnapshotBound);

    const snapshot = await this.sessionsTracker.currentSession?.getStatSnapshot();
    if (snapshot) {
      this.setSnapshot(snapshot);
    }
  }

  setSnapshot(stats: StatSnapshot) {
    console.log({ stats });
    this.mean3TD.textContent = Stats.formatTime(stats.mean3);
    this.avg5TD.textContent = Stats.formatTime(stats.avg5);
    this.avg12TD.textContent = Stats.formatTime(stats.avg12);
  }
}

if (customElements) {
  customElements.define("timer-stats-summary", StatsSummary);
}
