import { trForAttempt, MAX_NUM_RECENT_ATTEMPTS } from "./results-table";
import { downloadFile } from "./results/compat/download";
import { AttemptData, AttemptDataWithIDAndRev } from "./results/attempt";
import { TimerSession } from "./results/session";
import { convertToCSTimerFormat } from "./results/compat/cstimer";
import { convertToQQTimerFormat } from "./results/compat/qqtimer";
import { EventID, eventOrder, modifiedEventName } from "./events";
import { DEFAULT_EVENT, EVENT_PARAM_NAME, initialEventID } from "./url-params";

const session = new TimerSession();
let justRemoved: string;

function onSyncChange(
  change: PouchDB.Replication.SyncResult<AttemptData>,
): void {
  // We've only implemented full table reload (no DOM diffing). This is a hack to avoid doing that if we only removed a doc locally.
  if (
    !(
      change.change.docs.length === 1 &&
      change.change.docs[0]._id === justRemoved
    )
  ) {
    showData();
  } else {
    ("known!");
  }
}

function getEventID(): EventID {
  return (document.querySelector("#eventID") as HTMLSelectElement)
    .selectedOptions[0].value as EventID;
}

function getRangeSelector(): "most-recent" | "least-recent" | "best" | "worst" {
  return (document.querySelector("#rangeSelector") as HTMLSelectElement)
    .selectedOptions[0].value as any;
}

async function exportTCN(): Promise<void> {
  const jsonData = await session.allAttempts();
  downloadFile(
    `timer.cubing.net Format | ${new Date().toString()}.json`,
    JSON.stringify(jsonData, null, "  "),
  );
}

async function exportToCSTimer(): Promise<void> {
  const jsonData = await convertToCSTimerFormat(session, getEventID());
  downloadFile(
    `csTimer Format | ${new Date().toString()}.txt`,
    JSON.stringify(jsonData, null, "  "),
  );
}

async function exportToQQTimer(): Promise<void> {
  const strData = await convertToQQTimerFormat(session, getEventID());
  downloadFile(`qqtimer Format | ${new Date().toString()}.txt`, strData);
}

const optByEvent: { [eventID: string]: HTMLOptionElement } = {};

function addEventIDOptions(): void {
  const select = document.querySelector("#eventID") as HTMLSelectElement;
  for (const eventID of eventOrder) {
    const opt = document.createElement("option");
    opt.value = eventID;
    opt.textContent = modifiedEventName(eventID);
    if (eventID === initialEventID) {
      opt.setAttribute("selected", "selected");
    }
    optByEvent[eventID] = opt;
    select.appendChild(opt);
  }
}

export async function showData(): Promise<void> {
  const eventId = getEventID();
  const rangeSelector = getRangeSelector();

  const tableBody = document.querySelector("#results tbody") as HTMLBodyElement;
  tableBody.textContent = "";
  let unfilteredAttempts: AttemptDataWithIDAndRev[];
  switch (rangeSelector) {
    case "most-recent":
    // fallthrough
    case "least-recent": {
      unfilteredAttempts = (
        await session.mostRecentAttempts(
          MAX_NUM_RECENT_ATTEMPTS,
          eventId as EventID,
          rangeSelector === "most-recent",
        )
      ).docs;
      break;
    }
    case "best":
    // fallthrough
    case "worst": {
      unfilteredAttempts = await session.extremeTimes(
        MAX_NUM_RECENT_ATTEMPTS,
        rangeSelector === "worst",
        eventId as EventID,
      );
      break;
    }
    default:
      throw new Error("unexpected range selector");
  }
  const attempts = unfilteredAttempts.filter(
    (attempt: AttemptData) => attempt.event === eventId,
  );
  for (const attempt of attempts) {
    if (!attempt.totalResultMs) {
      continue;
    }
    tableBody.appendChild(trForAttempt(attempt));
  }
}

async function eventChanged(): Promise<void> {
  const eventID = getEventID();
  const newURL = new URL(location.href);
  newURL.searchParams.set(EVENT_PARAM_NAME, eventID);
  history.pushState(
    { event: eventID },
    `Results | ${eventID}`,
    `?${newURL.searchParams.toString()}`,
  );
  await showData();
}

async function rangeSelectorChanged(): Promise<void> {
  await showData();
}

window.addEventListener("popstate", (event) => {
  const select = document.querySelector("#eventID") as HTMLSelectElement;
  select.value = event.state?.event ?? DEFAULT_EVENT;
  showData();
});

window.addEventListener("load", async () => {
  addEventIDOptions();
  showData();
  session.startSync(onSyncChange);
  document.querySelector("#export")!.addEventListener("click", exportTCN);
  document
    .querySelector("#export-to-cstimer")!
    .addEventListener("click", exportToCSTimer);
  document
    .querySelector("#export-to-qqtimer")!
    .addEventListener("click", exportToQQTimer);
  document.querySelector("#eventID")!.addEventListener("change", eventChanged);
  document
    .querySelector("#rangeSelector")!
    .addEventListener("change", rangeSelectorChanged);
});
