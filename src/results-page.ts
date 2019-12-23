import "babel-polyfill"; // Prevent `regeneratorRuntime is not defined` error. https://github.com/babel/babel/issues/5085

import { TimerSession, allDocsResponseToAttemptList } from "./results/session";
import { AttemptData, AttemptDataWithIDAndRev } from "./results/attempt";
import { Stats } from "./stats";
import { algCubingNetLink, parse, Sequence, TraversalUp, Group, BlockMove, Commutator, Conjugate, Pause, NewLine, CommentShort, CommentLong } from "alg";
import { convertToCSTimerFormat } from "./results/compat/cstimer";
import { downloadFile } from "./results/compat/download";
import { convertToQQTimerFormat } from "./results/compat/qqtimer";
import { eventMetadata } from "./cubing";

const DEFAULT_EVENT_ID = "333";

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
  const scrambleLink = document.createElement("a");
  scrambleLink.href = algCubingNetLink({
    setup: parse(scramble),
    alg: new Sequence([])
  })
  scrambleLink.textContent = scramble;
  scrambleTD.appendChild(scrambleLink);
  return scrambleTD;
}

function solutionTD(attemptData: AttemptData): HTMLTableDataCellElement {
  const solutionTD = document.createElement("td");
  try {
    let title = `${Stats.formatTime(attemptData.totalResultMs)}s`;
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
  return solutionTD;
}

function trashTD(attempt: AttemptDataWithIDAndRev): HTMLTableDataCellElement {
  const scrambleTD = document.createElement("td");
  const trashButton = document.createElement("button");
  trashButton.textContent = "🗑";
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

async function showData(): Promise<void> {
  const eventId = getEventID();
  const tableBody = document.querySelector("#results tbody") as HTMLBodyElement;
  tableBody.textContent = "";
  const unfilteredAttempts: AttemptDataWithIDAndRev[] = (await session.mostRecentAttempts(1000)).rows.map((row) => row.doc!);
  const attempts = unfilteredAttempts.filter((attempt: AttemptData) => attempt.event === eventId);
  for (const attempt of attempts) {
    if (!attempt.totalResultMs) {
      continue;
    }
    const tr = document.createElement("tr");
    tr.appendChild(tdWithContent(Stats.formatTime(attempt.totalResultMs)));
    tr.appendChild(scrambleTD(attempt.scramble || ""));
    tr.appendChild(solutionTD(attempt));
    tr.appendChild(eventTD(attempt));
    tr.appendChild(tdWithContent(formatUnixTime(attempt.unixDate) + " | " + formatUnixDate(attempt.unixDate)));
    tr.appendChild(trashTD(attempt));
    tableBody.appendChild(tr);
  }
}

function onSyncChange(change: PouchDB.Replication.SyncResult<AttemptData>): void {
  // We've only implemented full table reload (no DOM diffing). This is a hack to avoid doing that if we only removed a doc locally.
  if (!(change.change.docs.length === 1 && change.change.docs[0]._id === justRemoved)) {
    showData();
  } else {
    "known!";
  }
}

function getEventID(): string {
  return (document.querySelector("#eventID") as HTMLSelectElement).selectedOptions[0].value;
}

async function exportTCN(): Promise<void> {
  const jsonData = await session.allAttempts();
  // navigator.clipboard.writeText(JSON.stringify(jsonData, null, "  "));
  downloadFile(`timer.cubing.net Format | ${new Date().toString()}.txt`, JSON.stringify(jsonData, null, "  "));
}

async function exportToCSTimer(): Promise<void> {
  const jsonData = await convertToCSTimerFormat(session, getEventID());
  // navigator.clipboard.writeText(JSON.stringify(jsonData, null, "  "));
  downloadFile(`csTimer Format | ${new Date().toString()}.txt`, JSON.stringify(jsonData, null, "  "));
}

async function exportToQQTimer(): Promise<void> {
  const jsonData = await convertToQQTimerFormat(session, getEventID());
  // navigator.clipboard.writeText(JSON.stringify(jsonData, null, "  "));
  downloadFile(`qqtimer Format | ${new Date().toString()}.txt`, JSON.stringify(jsonData, null, "  "));
}

async function eventChanged(): Promise<void> {
  await showData();
}

function addEventIDOptions(): void {
  const select = document.querySelector("#eventID") as HTMLSelectElement;
  for (const [id, info] of Object.entries(eventMetadata)) {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = info.name;
    if (id === DEFAULT_EVENT_ID) {
      opt.setAttribute("selected", "selected");
    }
    select.appendChild(opt);
  }
}

window.addEventListener("load", async () => {
  addEventIDOptions();
  showData();
  session.startSync(onSyncChange);
  document.querySelector("#export")!.addEventListener("click", exportTCN)
  document.querySelector("#export-to-cstimer")!.addEventListener("click", exportToCSTimer)
  document.querySelector("#export-to-qqtimer")!.addEventListener("click", exportToQQTimer)
  document.querySelector("#eventID")!.addEventListener("change", eventChanged);
})
