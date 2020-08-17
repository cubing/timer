import { ManagedCustomElement } from "./ManagedCustomElement";
import { Session } from "timer-db";

export class SessionSelect extends ManagedCustomElement {
  private selectElement: HTMLSelectElement;
  connectedCallback() {
    this.selectElement = this.addElement(document.createElement("select"));
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
}

if (customElements) {
  customElements.define("timer-session-select", SessionSelect);
}
