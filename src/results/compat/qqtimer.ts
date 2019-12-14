import { TimerSession } from "../session";

export async function convertToQQTimerFormat(session: TimerSession): Promise<string> {
  return (await session.allAttempts()).map((attempt) => attempt.totalResultMs).join(",") + "->"
}
