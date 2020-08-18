import { ManagedCustomElement, CSSSource } from "./ManagedCustomElement";
import { Session, SessionUUID } from "timer-db";

// @ts-ignore
import sessionSelectCSSText from "bundle-text:./SessionSelect.css";
import { SessionsTracker } from "../SessionsTracker";
const sessionSelectCSS = new CSSSource(sessionSelectCSSText);

export class SessionSelect extends ManagedCustomElement {
  private selectElement: HTMLSelectElement;

  constructor(private sessionsTracker: SessionsTracker) {
    super();
    this.sessionsTracker.addListener(this);
  }

  connectedCallback() {
    this.addCSS(sessionSelectCSS);
    this.selectElement = this.addElement(document.createElement("select"));

    this.selectElement.appendChild(
      document.createElement("option")
    ).textContent = "Loading sessions...";

    this.selectElement.addEventListener(
      "change",
      this.onSelectionChange.bind(this)
    );
  }

  onSessionListChange(sessions: Session[]): void {
    this.setSessions(sessions);
  }

  onCurrentSessionChange(newCurrentSession: Session): void {
    this.setCurrentSession(newCurrentSession);
  }

  setSessions(sessions: Session[]): void {
    this.selectElement.innerHTML = "";
    for (const session of sessions) {
      const option = this.selectElement.appendChild(
        document.createElement("option")
      );
      option.textContent = `${session.name} (${session.eventID})`;
      option.value = session._id;
    }
  }

  setCurrentSession(session: Session): void {
    this.selectElement.value = session._id;
  }

  onSelectionChange(): void {
    this.selectElement.blur();
    this.sessionsTracker.setCurrentSessionByID(this.selectElement.value);
  }
}

if (customElements) {
  customElements.define("timer-session-select", SessionSelect);
}
