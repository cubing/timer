import { TwistyPlayer } from "cubing/twisty";

export function upgraded<T extends HTMLElement>(elem: T, _t: new () => T): T {
  customElements.upgrade(elem);
  console.log("elem", elem, elem instanceof TwistyPlayer);
  return elem;
}

export const mainTwistyPlayer: TwistyPlayer = upgraded(
  document.querySelector<TwistyPlayer>("twisty-player")!,
  TwistyPlayer
);
