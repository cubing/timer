import { TimerDB } from "timer-db";

const db = new TimerDB();
globalThis.db = db;

console.log(db);
(async () => {
  const sessions = await db.getSessions();
  const session = sessions[0] ?? (await db.createSession("333", "333"));
  console.log(session);
  // for (const attempt of await session.nMostRecent(100)) {
  //   session.delete(attempt);
  // }
  // await session.add({
  //   resultTotalMs: Math.floor(8000 + Math.random() * 4000),
  //   unixDate: Date.now(),
  // });
  console.log(await session.nMostRecent(100));
})();
