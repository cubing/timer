import { TwistyAlgViewer, TwistyPlayer } from "cubing/twisty";

class TimerAppV3 {
  player = new TwistyPlayer();
  viewer: TwistyAlgViewer = document.querySelector("twisty-alg-viewer");
  constructor() {
    this.player.alg = "R U R'";
    this.viewer.setTwistyPlayer(this.player);
  }
}
