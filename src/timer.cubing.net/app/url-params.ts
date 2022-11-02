export const EVENT_PARAM_NAME = "event";
export const DEFAULT_EVENT = "333";

function getURLParam(name: string, defaultValue: string): string {
  const url = new URL(location.href);
  return url.searchParams.get(name) ?? defaultValue;
}

export function setURLParam(
  name: string,
  value: string,
  defaultValue: string,
): void {
  const url = new URL(location.href);
  if (value === defaultValue) {
    url.searchParams.delete(name);
  } else {
    url.searchParams.set(name, value);
  }
  window.history.pushState({}, "", url);
}

export const initialEventID = getURLParam(EVENT_PARAM_NAME, DEFAULT_EVENT);
