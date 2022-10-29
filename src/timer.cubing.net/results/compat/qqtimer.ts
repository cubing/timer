import { TimerSession } from "../session";
import { AttemptData } from "../attempt";

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
