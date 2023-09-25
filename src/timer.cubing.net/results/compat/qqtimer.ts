import { EventID } from "../../app/events";
import { AttemptData } from "../AttemptData";
import { TimerSession } from "../TimerSession";

export async function convertToQQTimerFormat(
  session: TimerSession,
  eventId: EventID,
): Promise<string> {
  return (
    // biome-ignore lint/style/useTemplate: Barely any templating to do.
    (await session.allAttempts())
      .filter((attempt: AttemptData) => attempt.event === eventId)
      .map((attempt) => attempt.totalResultMs)
      .join(",") + "->"
  );
}
