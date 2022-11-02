/**
 * For now, this module is just a thin wrapper around the Web WakeLock API[1].
 * However, that API is not supported in Safari just yet.
 *
 * In the future, something like NoSleepJS[2] could be loaded on-demand here to
 * widen browser support.
 *
 * [1]: https://developer.mozilla.org/en-US/docs/Web/API/WakeLock
 * [2]: https://github.com/richtr/NoSleep.js/
 */

let sentinel: WakeLockSentinel | null = null;
export async function enable() {
  if (sentinel) {
    return;
  }
  sentinel = await navigator.wakeLock?.request("screen");
}

export async function disable() {
  sentinel?.release();
  sentinel = null;
}
