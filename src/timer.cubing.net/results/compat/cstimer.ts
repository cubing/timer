import { AttemptData } from "../AttemptData";
import { TimerSession } from "../TimerSession";
import { data } from "./cstimer-data";

export type CSTimerAttempt = [[number, number], string, string, number];

export interface CSTimerData {
  session1: CSTimerAttempt[];
}

export async function importTimes(session: TimerSession): Promise<void> {
  for (const attempt of data.session1) {
    const attemptData: AttemptData = {
      totalResultMs:
        attempt[0][0] + attempt[0][1] + Math.floor(Math.random() * 1000),
      scramble: attempt[1],
      comment: attempt[2],
      unixDate: attempt[3] + Math.floor(Math.random() * 1000),
    };
    await session.addNewAttempt(attemptData);
  }
}

function attemptToCSTimerFormat(attempt: AttemptData): CSTimerAttempt {
  return [
    [0, attempt.totalResultMs],
    attempt.scramble || "",
    attempt.comment || "",
    attempt.unixDate,
  ];
}

export async function convertToCSTimerFormat(
  session: TimerSession,
  eventId: string,
): Promise<CSTimerData> {
  return {
    session1: (await session.allAttempts())
      .filter((attempt: AttemptData) => attempt.event === eventId)
      .map(attemptToCSTimerFormat),
  };
}
