import { data } from "./cstimer";
import { Session } from "./results/session";
import { AttemptData } from "./results/attempt";

export async function importTimes(session: Session): Promise<void> {
  for (const attempt of data.session1) {
    const attemptData: AttemptData = {
      totalResultMs: attempt[0][0] + attempt[0][1] + Math.floor(Math.random() * 1000),
      scramble: attempt[1],
      comment: attempt[2],
      unixDate: attempt[3] + Math.floor(Math.random() * 1000)
    }
    await session.addNewAttempt(attemptData);
  }
}
