import "cubing/twisty";
import { TwistyAlgViewer } from "cubing/twisty";
import { TextFitter } from "./fit-text";
import "./ScrambleBar.css";

export class ScrambleBar extends HTMLElement {
  textFitter = new TextFitter(this);
  algViewer: TwistyAlgViewer = this.querySelector("twisty-alg-viewer");
  constructor() {
    super();
    console.log("constructor");
  }
}

customElements.define("scramble-bar", ScrambleBar);
