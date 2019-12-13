import "babel-polyfill"; // Prevent `regeneratorRuntime is not defined` error. https://github.com/babel/babel/issues/5085

import { Session } from "./results/session";
import { AttemptData, AttemptDataWithIDAndRev } from "./results/attempt";
import { Stats } from "./stats";
import { algCubingNetLink, parse, Sequence } from "alg";

const session = new Session("session");

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

function trashTD(attempt: AttemptDataWithIDAndRev): HTMLTableDataCellElement {
  const scrambleTD = document.createElement("td");
  const trashButton = document.createElement("button");
  trashButton.textContent = "🗑";
  trashButton.addEventListener("click", () => {
    console.log("Removing", attempt);
    session.db.remove(attempt);
    trashButton.parentNode!.parentNode!.parentNode!.removeChild(trashButton.parentNode!.parentNode!);
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

window.addEventListener("load", async () => {
  const tableBody = document.querySelector("#results tbody") as HTMLBodyElement;
  const attempts = (await session.mostRecentAttempts(1000)).rows.map((row) => row.doc!);
  for (const attempt of attempts) {
    if (!attempt.totalResultMs) {
      continue;
    }
    const tr = document.createElement("tr");
    tr.appendChild(tdWithContent(Stats.formatTime(attempt.totalResultMs)));
    tr.appendChild(scrambleTD(attempt.scramble || ""));
    tr.appendChild(tdWithContent(attempt.event));
    tr.appendChild(tdWithContent(formatUnixTime(attempt.unixDate) + " | " + formatUnixDate(attempt.unixDate)));
    tr.appendChild(trashTD(attempt));
    tableBody.appendChild(tr);
  }
})
