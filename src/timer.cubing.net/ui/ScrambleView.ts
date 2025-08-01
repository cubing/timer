// import {ScrambleID} from "./scramble-worker"
import { Alg } from "cubing/alg";
import { eventInfo } from "cubing/puzzles";
import type { TwistyPlayer } from "cubing/twisty";
import { type EventID, eventOrder, modifiedEventName } from "../app/events";
import type { TimerApp } from "../app/TimerApp";
import { removeClassesStartingWith } from "./ui-util";

export type ScrambleWithEvent = {
  eventID: EventID;
  scramble: Alg | null;
};

export class ScrambleView {
  private eventSelectDropdown: HTMLSelectElement;
  private cubingIcon: HTMLElement;
  private scrambleText = document.querySelector(
    ".scramble-text",
  ) as HTMLElement;
  private scrambleTwistyAlgViewer: HTMLElement;
  private twistyPlayer = document.querySelector(
    "#scramble-display twisty-player",
  ) as TwistyPlayer;
  private optionElementsByEventID:
    | { [s: string]: HTMLOptionElement }
    | undefined;
  constructor(private timerApp: TimerApp) {
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
    for (const eventID of eventOrder) {
      const optionElement = document.createElement("option");
      optionElement.value = eventID;
      optionElement.textContent = modifiedEventName(eventID);

      this.optionElementsByEventID[eventID] = optionElement;
      this.eventSelectDropdown.appendChild(optionElement);
    }
  }

  setEvent(eventID: EventID) {
    removeClassesStartingWith(this.scrambleText, "event-");
    this.scrambleText.classList.add(`event-${eventID}`);

    const iconEventID =
      {
        master_tetraminx: "mtetram", // TOOD
        redi_cube: "redi", // TOOD
      }[eventID] ?? eventID;
    removeClassesStartingWith(this.cubingIcon, "event-");
    removeClassesStartingWith(this.cubingIcon, "unofficial-");
    this.cubingIcon.classList.add(`event-${iconEventID}`);
    this.cubingIcon.classList.add(`unofficial-${iconEventID}`);
    if (
      this.eventSelectDropdown.value !== eventID &&
      this.optionElementsByEventID?.[eventID]
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
