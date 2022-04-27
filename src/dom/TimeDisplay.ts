import "./TimeDisplay.css";

import { TextFitter } from "./fit-text";
import { timeToParts } from "../format";

export type MillisecondTimestamp = number; // TODO

export class TimeDisplay extends HTMLElement {
  textFitter = new TextFitter(this, {
    verticalRatio: 1.5,
  });

  emphasizedFirstElem = this.querySelector("time-first") as HTMLElement;
  emphasizedRestElem = this.querySelector("time-rest");
  deEmphasizedElem = this.querySelector("time-de-emphasized");
  set time(timeMs: MillisecondTimestamp) {
    timeMs = Math.floor(timeMs);
    const timeParts = timeToParts(timeMs);

    this.emphasizedFirstElem.textContent = timeParts.secFirst;
    this.emphasizedFirstElem.hidden = timeParts.secFirst === "";
    this.emphasizedRestElem.textContent = timeParts.secRest;
    this.deEmphasizedElem.textContent = timeParts.decimals;

    this.textFitter.onResize();
  }
}

customElements.define("time-display", TimeDisplay);
