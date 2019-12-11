import "babel-polyfill"; // Prevent `regeneratorRuntime is not defined` error. https://github.com/babel/babel/issues/5085

import {
  TimerApp
} from "./timerApp"
import { Session } from "./results/session";
import { Stats } from "./stats";

new TimerApp();

async function test() {
  const session = new Session("default");
  console.log(await session.addNewAttempt({
    totalResultMs: Math.floor(9000 + 3000 * Math.random()),
    unixDate: Date.now(),
  }));

  console.log(await session.db.allDocs())
  const attempt1 = await session.db.get((await session.db.allDocs()).rows[0].id);
  console.log({ attempt1 });

  const last5 = (await session.db.allDocs({
    limit: 5,
    descending: true,
    include_docs: true,
  })).rows.map((row) => row.doc!.totalResultMs);
  console.log(last5);
  console.log(Stats.trimmedAverage(last5));

  // (window as any).globalResults = globalResults;
  // const allDocs = (await globalResults.allDocs());
  // const sessionId = allDocs.rows[0].id;
  // // const session = await Session.load(sessionId);
  // console.log(session);
  // session.addAttempt({
  //   uuid: newUUID(),
  //   totalResultMs: 1234,
  //   unixDate: Date.now(),
  // })

  // const session = await Session.create("hi");
  // console.log(session);
  // (window as any).session = session;
}

test();
