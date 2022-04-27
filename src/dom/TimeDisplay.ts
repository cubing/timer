import "./TimeDisplay.css";

import { TextFitter } from "./fit-text";
import { timeToParts } from "../format";

type MillisecondTimestamp = number; // TODO

export class TimeDisplay extends HTMLElement {
  textFitter = new TextFitter(this, {
    verticalRatio: 1.5,
  });

  emphasizedFirstElem = this.querySelector("time-first");
  emphasizedRestElem = this.querySelector("time-rest");
  deEmphasizedElem = this.querySelector("time-de-emphasized");
  set time(timeMs: MillisecondTimestamp) {
    const timeParts = timeToParts(timeMs);

    this.emphasizedFirstElem.textContent = timeParts.secFirst;
    this.emphasizedRestElem.textContent = timeParts.secRest;
    this.deEmphasizedElem.textContent = timeParts.decimals;

    this.textFitter.onResize();
  }
}

customElements.define("time-display", TimeDisplay);
