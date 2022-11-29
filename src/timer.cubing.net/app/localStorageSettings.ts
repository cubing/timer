export function hideScrambleDisplay(): boolean {
	return localStorage.hideScrambleDisplay === "true";
}

export function setHideScrambleDisplay(hide: boolean): void {
	localStorage.hideScrambleDisplay = hide ? "true" : "false";
}
