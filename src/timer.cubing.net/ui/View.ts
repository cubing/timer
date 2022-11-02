import { Stats } from "../results/stats";
const THIN_CHARS = "1:";

export class View {
  private secFirstElement: HTMLElement;
  private secRestElement: HTMLElement;
  private decimalDigitsElement: HTMLElement;
  constructor(domElement: HTMLElement) {
    this.secFirstElement = <HTMLElement>(
      domElement.getElementsByClassName("sec-first")[0]
    );
    this.secRestElement = <HTMLElement>(
      domElement.getElementsByClassName("sec-rest")[0]
    );
    this.decimalDigitsElement = <HTMLElement>(
      domElement.getElementsByClassName("decimal-digits")[0]
    );
  }

  displayTime(time: number) {
    var parts = Stats.timeParts(time);
    this.secFirstElement.textContent = "";
    this.secRestElement.textContent = "";
    const secContainer = this.secRestElement;
    let lastChar: null | string = null;
    for (const char of `${parts.secFirst}${parts.secRest}`) {
      if (
        lastChar &&
        (THIN_CHARS.includes(char) || THIN_CHARS.includes(lastChar))
      ) {
        secContainer
          .appendChild(document.createElement("span"))
          .classList.add("spacer");
      }
      if (lastChar && "1" === char && "1" === lastChar) {
        secContainer
          .appendChild(document.createElement("span"))
          .classList.add("extra-spacer");
      }
      secContainer.append(char);
      lastChar = char;
    }
    this.decimalDigitsElement.textContent = parts.decimals;
  }
}
