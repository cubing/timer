import "babel-polyfill"; // Prevent `regeneratorRuntime is not defined` error. https://github.com/babel/babel/issues/5085

import {
  TimerApp
} from "./timerApp"
import { Session } from "./results/session";
import { globalResults } from "./results/db";
import { newUUID } from "./results/uuid";

new TimerApp();

async function test() {
  (window as any).globalResults = globalResults;
  const allDocs = (await globalResults.allDocs());
  const sessionId = allDocs.rows[0].id;
  const session = await Session.load(sessionId);
  console.log(session);
  session.addAttempt({
    uuid: newUUID(),
    totalResultMs: 1234,
    unixDate: Date.now(),
  })

  // const session = await Session.create("hi");
  // console.log(session);
  // (window as any).session = session;
}

test();
