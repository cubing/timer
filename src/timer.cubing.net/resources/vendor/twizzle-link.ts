import { Alg } from "cubing/alg";
import { eventInfo } from "cubing/puzzles";
import type { AttemptData } from "../../results/AttemptData";
import { Stats } from "../../results/Stats";

export function twizzleLink(
  event: string | undefined,
  setup: Alg | string | undefined,
  alg: Alg | string | undefined,
  title?: string,
) {
  setup = new Alg(setup);
  alg = new Alg(alg);
  const url = new URL("https://alpha.twizzle.net/edit/");

  if (event && event !== "333") {
    url.searchParams.set("puzzle", eventInfo(event)!.puzzleID);
  }
  if (alg && !alg.experimentalIsEmpty()) {
    url.searchParams.set("alg", alg.toString());
  }
  if (setup && !setup.experimentalIsEmpty()) {
    url.searchParams.set("setup-alg", setup.toString());
  }
  if (title) {
    url.searchParams.set("title", title);
  }
  return url.toString();
}

// TODO: Include title
export function twizzleLinkForAttempt(attemptData: AttemptData): string {
  return twizzleLink(
    attemptData.event,
    attemptData.scramble,
    attemptData.solution,
    attemptData.totalResultMs
      ? `${Stats.formatTime(
          attemptData.totalResultMs,
        )} seconds\nFrom timer.cubing.net`
      : undefined,
  );
}

// TODO: Include title
export function liveReconstructionLinkForAttempt(
  attemptData: AttemptData,
): string {
  const url = new URL(
    "https://experiments.cubing.net/cubing.js/live-reconstruction/",
  );
  url.searchParams.set("setup", attemptData.scramble ?? "");
  return url.toString();
}

// TODO: Include title
export function linkForAttempt(attemptData: AttemptData): string {
  return attemptData.event &&
    eventInfo(attemptData.event)?.puzzleID === "3x3x3" &&
    !attemptData.solution
    ? liveReconstructionLinkForAttempt(attemptData)
    : twizzleLinkForAttempt(attemptData);
}
