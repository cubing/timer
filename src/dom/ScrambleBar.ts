import { TwistyAlgViewer } from "cubing/dist/types/twisty";
import { TextFitter } from "./fit-text";

export class ScrambleBar extends HTMLElement {
  textFitter = new TextFitter(this);
  algViewer: TwistyAlgViewer = this.querySelector("twisty-alg-viewer");
}

customElements.define("scramble-bar", ScrambleBar);