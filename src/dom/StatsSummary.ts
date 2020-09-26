// @ts-ignore
import statsSummaryCSSText from "bundle-text:./StatsSummary.css";
import { Session, StatSnapshot } from "timer-db";
import { SessionsTracker } from "../SessionsTracker";
import { CSSSource, ManagedCustomElement } from "./ManagedCustomElement";

const statsSummaryCSS = new CSSSource(statsSummaryCSSText);

export class StatsSummary extends ManagedCustomElement {
  private currentSession: Session | null = null;
  private onStatsSnapshotBound = this.setSnapshot.bind(this);

  private countTd: HTMLElement;

  constructor(sessionsTracker: SessionsTracker) {
    super();
    this.addCSS(statsSummaryCSS);
    sessionsTracker.addListener(this);
    if (sessionsTracker.currentSession) {
      async () => {
        const snapshot = await sessionsTracker.currentSession?.getStatSnapshot();
        if (snapshot) {
          this.setSnapshot(snapshot);
        }
      };
    }

    const table = this.contentWrapper.appendChild(
      document.createElement("table")
    );

    const tbodyMeta = table.appendChild(document.createElement("tbody"));
    const tr = table.appendChild(document.createElement("tr"));
    const keyTd = table.appendChild(document.createElement("td"));
    keyTd.textContent = "count:";
    this.countTd = table.appendChild(document.createElement("td"));
    this.countTd.textContent = "-";
  }

  onSessionListChange(_sessions: Session[]): void {}
  onCurrentSessionChange(newCurrentSession: Session): void {
    if (this.currentSession) {
      this.currentSession.removeStatListener(this.onStatsSnapshotBound);
    }

    this.currentSession = newCurrentSession;
    this.currentSession.addStatListener(this.onStatsSnapshotBound);
  }

  setSnapshot(stats: StatSnapshot) {
    console.log(stats);
    this.countTd.textContent = stats.avg5?.toString() ?? "-";
  }
}

if (customElements) {
  customElements.define("timer-stats-summary", StatsSummary);
}
