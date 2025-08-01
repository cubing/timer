import { Alg } from "cubing/alg";
import { eventOrder, modifiedEventName } from "../app/events";
import { linkForAttempt } from "../resources/vendor/twizzle-link";
import type {
  AttemptData,
  AttemptDataWithIDAndRev,
} from "../results/AttemptData";
import { Stats } from "../results/Stats";
import { TimerSession } from "../results/TimerSession";
import { playIcon, trashIcon } from "./material-icons";

export const MAX_NUM_RECENT_ATTEMPTS = 100;

const session = new TimerSession();
// @ts-ignore
// biome-ignore lint/correctness/noUnusedVariables: TODO: this assignment is meant to be shared with a different file.
let justRemoved: string;

function tdWithContent(content?: string): HTMLTableDataCellElement {
  const td = document.createElement("td");
  td.textContent = content || "";
  return td;
}

// scramble?: Alg, event?: string
function scrambleTD(
  attemptData: AttemptDataWithIDAndRev,
): HTMLTableDataCellElement {
  const scrambleTD = document.createElement("td");
  if (attemptData.scramble) {
    let algo: null | Alg = null;
    try {
      algo = Alg.fromString(attemptData.scramble);
    } catch {
      const button = document.createElement("button");
      button.textContent = "🔀";
      button.addEventListener("click", () => {
        scrambleTD.textContent = attemptData.scramble ?? ".";
      });
      scrambleTD.appendChild(button);
    }
    if (algo) {
      const scrambleLink = document.createElement("a");
      scrambleLink.href = linkForAttempt(attemptData);
      scrambleLink.appendChild(playIcon());
      scrambleTD.appendChild(scrambleLink);
    }
  } else {
    scrambleTD.textContent = "N/A";
  }
  return scrambleTD;
}

function solutionTD(attemptData: AttemptData): HTMLTableDataCellElement {
  const solutionTD = document.createElement("td");
  try {
    // TODO: use `title`
    // let title = `${Stats.formatTime(attemptData.totalResultMs)}s`;
    // if (attemptData.event) {
    //   // TODO: Use `eventMetadata[attemptData.event].name` once scaping works properly.
    //   title += `\n${attemptData.event}`;
    // }
    // if (localStorage.pouchDBUsername) {
    //   title += `\n${localStorage.pouchDBUsername}`;
    // }
    // if (attemptData.unixDate) {
    //   title += `\n${formatUnixDate(attemptData.unixDate)}`;
    // }
    if (attemptData.solution) {
      const scrambleLink = document.createElement("a");
      scrambleLink.href = linkForAttempt(attemptData);
      scrambleLink.appendChild(playIcon());
      solutionTD.appendChild(scrambleLink);
      // const node = document.createTextNode(` (${countMoves(attemptData.solution)} ETM)`);
      // solutionTD.appendChild(node);
    }
  } catch (e) {
    console.error(e);
  }
  const editButton = document.createElement("button");
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => {
    solutionTD.removeChild(editButton);
    const textarea = document.createElement("textarea");
    textarea.value = attemptData.solution ?? "";
    const updateButton = document.createElement("button");
    updateButton.textContent = "Update";
    updateButton.addEventListener("click", () => {
      console.log(textarea);
      attemptData.solution = textarea.value ?? undefined;
      console.log(attemptData);
      session.db.put(attemptData);
    });
    solutionTD.appendChild(textarea);
    solutionTD.appendChild(updateButton);
  });
  solutionTD.appendChild(editButton);

  if (attemptData.event === "sq1") {
    const button = document.createElement("button");
    if (!attemptData.parities) {
      button.textContent = "Parity";
    } else if (!("permutationParity" in attemptData.parities)) {
      button.textContent = "Parity: ?";
    } else {
      button.textContent = `Parity: ${
        attemptData.parities.permutationParity ? "☹️" : "😎"
      }`;
    }
    button.addEventListener("click", () => {
      if (
        !attemptData.parities ||
        !("permutationParity" in attemptData.parities)
      ) {
        attemptData.parities = { permutationParity: false };
      } else if (!attemptData.parities.permutationParity) {
        attemptData.parities = { permutationParity: true };
      } else {
        delete attemptData.parities.permutationParity;
      }
      session.db.put(attemptData);
    });
    solutionTD.appendChild(button);
  }
  return solutionTD;
}

function trashTD(attempt: AttemptDataWithIDAndRev): HTMLTableDataCellElement {
  const scrambleTD = document.createElement("td");
  const trashButton = document.createElement("button");
  trashButton.appendChild(trashIcon());
  trashButton.addEventListener("click", () => {
    console.log("Removing", attempt);
    session.db.remove(attempt);
    trashButton.parentNode!.parentNode!.parentNode!.removeChild(
      trashButton.parentNode!.parentNode!,
    );
    justRemoved = attempt._id;
  });
  scrambleTD.appendChild(trashButton);
  return scrambleTD;
}

function pad(s: number): string {
  return `0${s}`.slice(-2);
}

function formatUnixTime(unixDate: number): string {
  const date = new Date(unixDate);
  return `${date.getHours()}:${pad(date.getMinutes())}`;
}

function formatUnixDate(unixDate: number): string {
  const date = new Date(unixDate);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate() + 1,
  )}`;
}

function eventTD(attempt: AttemptDataWithIDAndRev): HTMLTableDataCellElement {
  const td = document.createElement("td");
  const select: HTMLSelectElement = document.createElement("select");
  for (const eventID of eventOrder) {
    const opt = document.createElement("option");
    opt.textContent = modifiedEventName(eventID);
    opt.value = eventID;
    if (eventID === attempt.event) {
      opt.setAttribute("selected", "selected");
    }
    select.appendChild(opt);
  }
  select.addEventListener("change", async () => {
    attempt.event = select.selectedOptions[0].value;
    const putResult = await session.db.put(attempt);
    console.log("Updated event for attempt", attempt, putResult);
  });
  td.appendChild(select);
  return td;
}

function deviceTD(attempt: AttemptDataWithIDAndRev): HTMLTableDataCellElement {
  const td = document.createElement("td");
  td.textContent = attempt.device || "";
  return td;
}

export function trForAttempt(
  attempt: AttemptDataWithIDAndRev,
  condensed: boolean = false,
): HTMLTableRowElement {
  const tr = document.createElement("tr");
  tr.appendChild(tdWithContent(Stats.formatTime(attempt.totalResultMs)));
  if (!condensed) {
    tr.appendChild(scrambleTD(attempt));
    tr.appendChild(solutionTD(attempt));
  } else {
    if (attempt.solution) {
      tr.appendChild(solutionTD(attempt));
    } else {
      tr.appendChild(scrambleTD(attempt));
    }
  }
  if (!condensed) {
    tr.appendChild(eventTD(attempt));
    tr.appendChild(
      tdWithContent(
        `${formatUnixTime(attempt.unixDate)} | ${formatUnixDate(
          attempt.unixDate,
        )}`,
      ),
    );
    tr.appendChild(deviceTD(attempt));
  } else {
    const todayDate = formatUnixDate(Date.now()); // TODO: optimize
    const formattedTimeOfDay = formatUnixTime(attempt.unixDate);
    let formattedDate = formattedTimeOfDay;
    const formattedDateStamp = formatUnixDate(attempt.unixDate);
    if (formattedDateStamp !== todayDate) {
      formattedDate = "(old)";
    }
    const td = tdWithContent(formattedDate);
    td.title = `${formattedTimeOfDay} | ${formattedDateStamp}`;
    tr.appendChild(td);
  }
  tr.appendChild(trashTD(attempt));
  return tr;
}
