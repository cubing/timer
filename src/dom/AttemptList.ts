import { CSSSource, ManagedCustomElement } from "./ManagedCustomElement";
// @ts-ignore
import attemptListCSSText from "bundle-text:./AttemptList.css";
import { SessionsTracker } from "../SessionsTracker";

const attemptListCSS = new CSSSource(attemptListCSSText);

export class AttemptList extends ManagedCustomElement {
  private tbody: HTMLTableSectionElement;

  constructor(private sessionsTracker: SessionsTracker) {
    super();
  }

  connectedCallback(): void {
    this.addCSS(attemptListCSS);

    const table = this.addElement(document.createElement("table"));
    this.tbody = this.addElement(document.createElement("tbody"));
    console.log(this.sessionsTracker.currentSession?.getStatSnapshot());
  }
}

if (customElements) {
  customElements.define("timer-attempt-list", AttemptList);
}
