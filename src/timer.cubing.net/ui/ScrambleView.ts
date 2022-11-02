import { EventID, eventOrder, modifiedEventName } from "../events";
// import {ScrambleID} from "./scramble-worker"
import { Alg } from "cubing/alg";
import { eventInfo } from "cubing/puzzles";
import type { TwistyPlayer } from "cubing/twisty";
import { TimerApp } from "../TimerApp";
import { removeClassesStartingWith } from "../util";

export type ScrambleWithEvent = {
  eventID: EventID;
  scramble: Alg | null;
};

export class ScrambleView {
  private scrambleElement: HTMLElement;
  private eventSelectDropdown: HTMLSelectElement;
  private cubingIcon: HTMLElement;
  private scrambleText = document.querySelector(
    ".scramble-text",
  ) as HTMLElement;
  private scrambleTwistyAlgViewer: HTMLElement;
  private twistyPlayer = document.querySelector(
    "#scramble-display twisty-player",
  ) as TwistyPlayer;
  private optionElementsByEventID: { [s: string]: HTMLOptionElement };
  constructor(private timerApp: TimerApp) {
    this.scrambleElement = <HTMLElement>document.getElementById("scramble-bar");
    this.eventSelectDropdown = <HTMLSelectElement>(
      document.getElementById("event-select-dropdown")
    );
    this.cubingIcon = <HTMLElement>document.getElementById("cubing-icon");
    this.scrambleTwistyAlgViewer = <HTMLAnchorElement>(
      document.querySelector(".scramble-text twisty-alg-viewer")
    );

    this.eventSelectDropdown.addEventListener("change", () => {
      this.eventSelectDropdown.blur();
      this.timerApp.setEvent(this.eventSelectDropdown.value as EventID, true);
    });

    this.initializeSelectDropdown();
  }

  initializeSelectDropdown() {
    this.optionElementsByEventID = {};
    for (var eventID of eventOrder) {
      var optionElement = document.createElement("option");
      optionElement.value = eventID;
      optionElement.textContent = modifiedEventName(eventID);

      this.optionElementsByEventID[eventID] = optionElement;
      this.eventSelectDropdown.appendChild(optionElement);
    }
  }

  setEvent(eventID: EventID) {
    removeClassesStartingWith(this.scrambleText, "event-");
    this.scrambleText.classList.add("event-" + eventID);
    removeClassesStartingWith(this.cubingIcon, "icon-");
    this.cubingIcon.classList.add("icon-" + eventID);
    if (
      this.eventSelectDropdown.value !== eventID &&
      this.optionElementsByEventID[eventID]
    ) {
      this.optionElementsByEventID[eventID].selected = true;
    }
    this.setScramblePlaceholder(eventID);
    this.twistyPlayer.puzzle = eventInfo(eventID)!.puzzleID;
  }

  setScramblePlaceholder(eventID: EventID) {
    this.setScramble({
      eventID,
      scramble: null,
    });
  }

  setScramble(scrambleWithEvent: ScrambleWithEvent) {
    const { scramble } = scrambleWithEvent;
    if (!scramble) {
      this.scrambleText.classList.remove("show-scramble");
      this.twistyPlayer.classList.add("dim");
      this.twistyPlayer.alg = "";
      return;
    }
    this.scrambleText.classList.add("show-scramble");
    const scrambleString = scramble.toString();

    this.scrambleTwistyAlgViewer.classList.remove("stale");
    this.twistyPlayer.classList.remove("dim");
    this.scrambleTwistyAlgViewer.textContent = scrambleString; // TODO: animation

    this.twistyPlayer.puzzle = eventInfo(scrambleWithEvent.eventID)?.puzzleID!;
    this.twistyPlayer.alg = scrambleWithEvent.scramble ?? new Alg();
    this.twistyPlayer.timestamp = "end";
    this.twistyPlayer.animate([{ opacity: 0.25 }, { opacity: 1 }], {
      duration: 1000,
      easing: "ease-out",
    });
  }

  clearScramble() {
    this.staleScramble(false);
  }

  staleScramble(stale: boolean): void {
    this.scrambleText.classList.toggle("stale", stale);
  }
}
