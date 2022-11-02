import { TimerSession } from "../TimerSession";
import { AttemptData } from "../AttemptData";

export async function convertToQQTimerFormat(
  session: TimerSession,
  eventId: string,
): Promise<string> {
  return (
    (await session.allAttempts())
      .filter((attempt: AttemptData) => attempt.event === eventId)
      .map((attempt) => attempt.totalResultMs)
      .join(",") + "->"
  );
}
