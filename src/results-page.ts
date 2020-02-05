import { trForAttempt, MAX_NUM_RECENT_ATTEMPTS } from "./results-table";
import { downloadFile } from "./results/compat/download";
import { AttemptData, AttemptDataWithIDAndRev } from "./results/attempt";
import { TimerSession } from "./results/session";
import { convertToCSTimerFormat } from "./results/compat/cstimer";
import { convertToQQTimerFormat } from "./results/compat/qqtimer";
import { eventMetadata, EventName } from "./cubing";

const EVENT_PARAM_NAME = "event";
const DEFAULT_EVENT = "333";

function getURLParam(name: string, defaultValue: string): string {
  const url = new URL(location.href);
  return url.searchParams.get(name) ?? defaultValue;
}

const initialEventID = getURLParam(EVENT_PARAM_NAME, DEFAULT_EVENT);

const session = new TimerSession();
let justRemoved: string;

function onSyncChange(change: PouchDB.Replication.SyncResult<AttemptData>): void {
  // We've only implemented full table reload (no DOM diffing). This is a hack to avoid doing that if we only removed a doc locally.
  if (!(change.change.docs.length === 1 && change.change.docs[0]._id === justRemoved)) {
    showData(getEventID());
  } else {
    "known!";
  }
}

function getEventID(): EventName {
  return (document.querySelector("#eventID") as HTMLSelectElement).selectedOptions[0].value as EventName;
}

async function exportTCN(): Promise<void> {
  const jsonData = await session.allAttempts();
  downloadFile(`timer.cubing.net Format | ${new Date().toString()}.json`, JSON.stringify(jsonData, null, "  "));
}

async function exportToCSTimer(): Promise<void> {
  const jsonData = await convertToCSTimerFormat(session, getEventID());
  downloadFile(`csTimer Format | ${new Date().toString()}.txt`, JSON.stringify(jsonData, null, "  "));
}

async function exportToQQTimer(): Promise<void> {
  const strData = await convertToQQTimerFormat(session, getEventID());
  downloadFile(`qqtimer Format | ${new Date().toString()}.txt`, strData);
}

const optByEvent: { [eventName: string]: HTMLOptionElement } = {};

function addEventIDOptions(): void {
  const select = document.querySelector("#eventID") as HTMLSelectElement;
  for (const [id, info] of Object.entries(eventMetadata)) {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = info.name;
    if (id === initialEventID) {
      opt.setAttribute("selected", "selected");
    }
    optByEvent[id] = opt;
    select.appendChild(opt);
  }
}

export async function showData(eventId: EventName): Promise<void> {
  const tableBody = document.querySelector("#results tbody") as HTMLBodyElement;
  tableBody.textContent = "";
  const unfilteredAttempts: AttemptDataWithIDAndRev[] = (await session.mostRecentAttemptsForEvent(eventId as EventName, MAX_NUM_RECENT_ATTEMPTS)).docs;
  const attempts = unfilteredAttempts.filter((attempt: AttemptData) => attempt.event === eventId);
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
  history.pushState({ event: eventID }, `Results | ${eventID}`, "?" + newURL.searchParams.toString())
  await showData(getEventID());
}

window.addEventListener("popstate", (event) => {
  const select = document.querySelector("#eventID") as HTMLSelectElement;
  select.value = event.state?.event ?? DEFAULT_EVENT;
  showData(getEventID());
});

window.addEventListener("load", async () => {
  addEventIDOptions();
  showData(getEventID());
  session.startSync(onSyncChange);
  document.querySelector("#export")!.addEventListener("click", exportTCN)
  document.querySelector("#export-to-cstimer")!.addEventListener("click", exportToCSTimer)
  document.querySelector("#export-to-qqtimer")!.addEventListener("click", exportToQQTimer)
  document.querySelector("#eventID")!.addEventListener("change", eventChanged);
})
