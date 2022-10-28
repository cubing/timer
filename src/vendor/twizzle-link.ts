import { Alg } from "cubing/alg";
import { eventInfo } from "cubing/puzzles";

export function twizzleLink(
	event: string,
	setup: Alg | string,
	alg: Alg | string,
) {
	setup = new Alg(setup);
	alg = new Alg(alg);
	const url = new URL("https://alpha.twizzle.net/edit/");

	if (event !== "333") {
		url.searchParams.set("puzzle", eventInfo(event)!.puzzleID);
	}
	if (!alg.experimentalIsEmpty()) {
		url.searchParams.set("alg", alg.toString());
	}
	if (!alg.experimentalIsEmpty()) {
		url.searchParams.set("setup-alg", setup.toString());
	}
	return url.toString();
}
