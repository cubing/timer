import "babel-polyfill"; // Prevent `regeneratorRuntime is not defined` error. https://github.com/babel/babel/issues/5085
import { algCubingNetLink, parse, Sequence } from "cubing/alg";
import { eventMetadata, EventName } from "./cubing";
import { AttemptData, AttemptDataWithIDAndRev } from "./results/attempt";
import { TimerSession } from "./results/session";
import { Stats } from "./stats";
import { trashIcon, playIcon } from "./material-icons";

export const MAX_NUM_RECENT_ATTEMPTS = 100;

// class CountMoves extends TraversalUp<number> {
//   public traverseSequence(sequence: Sequence): number {
//     let total = 0;
//     for (const part of sequence.nestedUnits) {
//       total += this.traverse(part);
//     }
//     return total;
//   }
//   public traverseGroup(group: Group): number {
//     return this.traverseSequence(group.nestedSequence);
//   }
//   public traverseBlockMove(blockMove: BlockMove): number {
//     return 1;
//   }
//   public traverseCommutator(commutator: Commutator): number {
//     return 2 * (this.traverseSequence(commutator.A) + this.traverseSequence(commutator.B));
//   }
//   public traverseConjugate(conjugate: Conjugate): number {
//     return 2 * (this.traverseSequence(conjugate.A)) + this.traverseSequence(conjugate.B);
//   }
//   public traversePause(pause: Pause): number { return 0; }
//   public traverseNewLine(newLine: NewLine): number { return 0; }
//   public traverseCommentShort(commentShort: CommentShort): number { return 0; }
//   public traverseCommentLong(commentLong: CommentLong): number { return 0; }
// }

// (window as any).CM = CountMoves

// // const countMovesInstance = new CountMoves();
// // const countMoves = countMovesInstance.traverse.bind(countMovesInstance);

const session = new TimerSession();
let justRemoved: string;

function tdWithContent(content?: string): HTMLTableDataCellElement {
  const td = document.createElement("td");
  td.textContent = content || "";
  return td;
}

function scrambleTD(scramble: string): HTMLTableDataCellElement {
  const scrambleTD = document.createElement("td");
  if (scramble) {
    let algo: null | Sequence = null;;
    try {
      algo = parse(scramble);
    } catch (e) {
      const button = document.createElement("button");
      button.textContent = "🔀";
      button.addEventListener("click", () => {
        scrambleTD.textContent = scramble;
      });
      scrambleTD.appendChild(button);
    }
    if (algo) {
      const scrambleLink = document.createElement("a");
      scrambleLink.href = algCubingNetLink({
        setup: algo,
        alg: new Sequence([])
      })
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
    let title = `${Stats.formatTime(attemptData.totalResultMs)}s`;
    if (attemptData.event) {
      // TODO: Use `eventMetadata[attemptData.event].name` once scaping works properly.
      title += `\n${attemptData.event}`;
    }
    if (localStorage.pouchDBUsername) {
      title += `\n${localStorage.pouchDBUsername}`;
    }
    if (attemptData.unixDate) {
      title += `\n${formatUnixDate(attemptData.unixDate)}`;
    }
    if (attemptData.solution) {
      const scrambleLink = document.createElement("a");
      scrambleLink.href = algCubingNetLink({
        setup: parse(attemptData.scramble || ""),
        alg: parse(attemptData.solution || ""),
        title
      })
      scrambleLink.textContent = "▶️";
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
  })
  solutionTD.appendChild(editButton);

  if (attemptData.event === "sq1") {
    const button = document.createElement("button");
    if (!attemptData.parities) {
      button.textContent = "Parity"
    } else if (!("permutationParity" in attemptData.parities)) {
      button.textContent = "Parity: ?"
    } else {
      button.textContent = "Parity: " + (attemptData.parities.permutationParity ? "☹️" : "😎");
    }
    button.addEventListener("click", () => {
      if (!attemptData.parities || !("permutationParity" in attemptData.parities)) {
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
    trashButton.parentNode!.parentNode!.parentNode!.removeChild(trashButton.parentNode!.parentNode!);
    justRemoved = attempt._id;
  })
  scrambleTD.appendChild(trashButton);
  return scrambleTD;
}

function pad(s: number): string {
  return ("0" + s).slice(-2)
}

function formatUnixTime(unixDate: number): string {
  const date = new Date(unixDate);
  return date.getHours() + ":" + pad(date.getMinutes());
}

function formatUnixDate(unixDate: number): string {
  const date = new Date(unixDate);
  return date.getFullYear() + "-" + pad((date.getMonth() + 1)) + "-" + pad((date.getDate() + 1));
}

function eventTD(attempt: AttemptDataWithIDAndRev): HTMLTableDataCellElement {
  const td = document.createElement("td");
  const select: HTMLSelectElement = document.createElement("select");
  for (const [id, info] of Object.entries(eventMetadata)) {
    const opt = document.createElement("option");
    opt.textContent = info.name;
    opt.value = id;
    if (id == attempt.event) {
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

export function trForAttempt(attempt: AttemptDataWithIDAndRev, condensed: boolean = false): HTMLTableRowElement {
  const tr = document.createElement("tr");
  tr.appendChild(tdWithContent(Stats.formatTime(attempt.totalResultMs)));
  if (!condensed) {
    tr.appendChild(scrambleTD(attempt.scramble || ""));
    tr.appendChild(solutionTD(attempt));
  } else {
    if (attempt.solution) {
      tr.appendChild(solutionTD(attempt));
    } else {
      tr.appendChild(scrambleTD(attempt.scramble || ""));
    }
  }
  if (!condensed) {
    tr.appendChild(eventTD(attempt));
    tr.appendChild(tdWithContent(formatUnixTime(attempt.unixDate) + " | " + formatUnixDate(attempt.unixDate)));
    tr.appendChild(deviceTD(attempt));
  } else {
    const todayDate = formatUnixDate(Date.now()); // TODO: optimize
    const formattedTimeOfDay = formatUnixTime(attempt.unixDate);
    let formattedDate = formattedTimeOfDay;
    const formattedDateStamp = formatUnixDate(attempt.unixDate)
    if (formattedDateStamp !== todayDate) {
      formattedDate = "(not today)";
    }
    const td = tdWithContent(formattedDate);
    td.title = formattedTimeOfDay + " | " + formattedDateStamp;
    tr.appendChild(td);
  }
  tr.appendChild(trashTD(attempt));
  return tr;
}
