export function hideScrambleDisplay(): boolean {
  return localStorage.hideScrambleDisplay === "true";
}

export function setHideScrambleDisplay(hide: boolean): void {
  localStorage.hideScrambleDisplay = hide ? "true" : "false";
}

export function preferHarmonicMean(): boolean {
  return localStorage.preferHarmonicMean === "true";
}

export function setPreferHarmonicMean(hide: boolean): void {
  localStorage.preferHarmonicMean = hide ? "true" : "false";
}
